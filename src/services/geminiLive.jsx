import { useRef, useEffect, useCallback } from "react";
import { GoogleGenAI } from "@google/genai";
import { base64ToBytes, decodeAudioData, createPcmBlob } from "./audioUtils";

export const useGeminiLive = ({
  onStatusChange,
  onTranscript,
  onAudioLevel,
  onError,
  muted,
}) => {
  const stateRef = useRef({
    inputAudioContext: null,
    outputAudioContext: null,
    stream: null,
    inputNode: null,
    outputNode: null,
    sourceNode: null,
    nextStartTime: 0,
    sources: new Set(),
    sessionPromise: null,
    isInterrupted: false,
  });

  // Store callbacks and mute state in ref
  const refs = useRef({
    onStatusChange,
    onTranscript,
    onAudioLevel,
    onError,
    muted,
  });

  useEffect(() => {
    refs.current = {
      onStatusChange,
      onTranscript,
      onAudioLevel,
      onError,
      muted,
    };
  }, [onStatusChange, onTranscript, onAudioLevel, onError, muted]);

  const stopAllAudioOutput = useCallback(() => {
    const state = stateRef.current;
    state.sources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    state.sources.clear();
    state.nextStartTime = state.outputAudioContext?.currentTime || 0;
  }, []);

  const disconnect = useCallback(async () => {
    const state = stateRef.current;
    const currentRefs = refs.current;

    if (state.inputNode) {
      state.inputNode.disconnect();
      state.inputNode.onaudioprocess = null;
      state.inputNode = null;
    }
    if (state.sourceNode) {
      state.sourceNode.disconnect();
      state.sourceNode = null;
    }
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
    if (state.inputAudioContext) {
      try {
        await state.inputAudioContext.close();
      } catch (e) {}
      state.inputAudioContext = null;
    }
    if (state.outputAudioContext) {
      stopAllAudioOutput();
      try {
        await state.outputAudioContext.close();
      } catch (e) {}
      state.outputAudioContext = null;
    }

    if (state.sessionPromise) {
      state.sessionPromise
        .then((session) => {
          try {
            session.close();
          } catch (e) {
            console.error("Session close error", e);
          }
        })
        .catch(() => {});
      state.sessionPromise = null;
    }

    if (currentRefs.onStatusChange) currentRefs.onStatusChange("disconnected");
  }, [stopAllAudioOutput]);

  const connect = useCallback(
    async (jobConfig) => {
      const state = stateRef.current;
      const currentRefs = refs.current;

      try {
        currentRefs.onStatusChange("connecting");

        // Initialize client here to ensure API Key is ready
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

        const AudioContextConstructor = window.AudioContext;
        state.inputAudioContext = new AudioContextConstructor({
          sampleRate: 16000,
        });
        state.outputAudioContext = new AudioContextConstructor({
          sampleRate: 24000,
        });

        // Attempt to resume contexts if suspended (browser requirement)
        if (state.inputAudioContext.state === "suspended") {
          await state.inputAudioContext
            .resume()
            .catch((e) => console.warn("Input resume failed", e));
        }
        if (state.outputAudioContext.state === "suspended") {
          await state.outputAudioContext
            .resume()
            .catch((e) => console.warn("Output resume failed", e));
        }

        state.outputNode = state.outputAudioContext.createGain();
        state.outputNode.connect(state.outputAudioContext.destination);

        state.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const systemInstructionText = `You are an expert professional interviewer conducting a job interview.
Candidate's Target Role: ${jobConfig.title}
Level: ${jobConfig.level}
Company Context: ${jobConfig.company}
Job Description: ${
          jobConfig.description || "Standard requirements for this role."
        }

Guidelines:
1. Start by briefly introducing yourself as the AI Interviewer and ask the candidate to introduce themselves.
2. Ask one question at a time. Wait for the user's response.
3. Keep your responses concise (under 3 sentences) unless explaining a complex concept.
4. Be professional, encouraging, but rigorous.
5. If the candidate struggles, offer a small hint.
6. Dig deeper into their answers with follow-up questions.
7. Focus on technical skills and behavioral fit relevant to ${
          jobConfig.title
        }.`;

        const handleMessage = async (message) => {
          const cb = refs.current;
          const st = stateRef.current;

          // Transcripts
          if (message.serverContent?.outputTranscription?.text) {
            cb.onTranscript(
              message.serverContent.outputTranscription.text,
              false,
              false
            );
          }
          if (message.serverContent?.inputTranscription?.text) {
            cb.onTranscript(
              message.serverContent.inputTranscription.text,
              true,
              false
            );
          }
          if (message.serverContent?.turnComplete) {
            cb.onTranscript("", false, true);
            cb.onTranscript("", true, true);
          }

          // Audio Output
          const base64Audio =
            message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && st.outputAudioContext && st.outputNode) {
            try {
              // Sync timing
              st.nextStartTime = Math.max(
                st.nextStartTime,
                st.outputAudioContext.currentTime
              );

              const audioBuffer = await decodeAudioData(
                base64ToBytes(base64Audio),
                st.outputAudioContext,
                24000,
                1
              );
              const source = st.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(st.outputNode);
              source.addEventListener("ended", () => {
                st.sources.delete(source);
              });
              source.start(st.nextStartTime);
              st.nextStartTime += audioBuffer.duration;
              st.sources.add(source);
            } catch (e) {
              console.error("Error decoding audio", e);
            }
          }

          // Interruption
          if (message.serverContent?.interrupted) {
            stopAllAudioOutput();
            st.isInterrupted = true;
            setTimeout(() => (st.isInterrupted = false), 1000);
          }
        };

        state.sessionPromise = ai.live.connect({
          model: "gemini-2.5-flash-native-audio-preview-09-2025",
          callbacks: {
            onopen: () => {
              refs.current.onStatusChange("connected");
              // Start Audio Input logic
              if (
                !state.inputAudioContext ||
                !state.stream ||
                !state.sessionPromise
              )
                return;

              state.sourceNode =
                state.inputAudioContext.createMediaStreamSource(state.stream);
              state.inputNode = state.inputAudioContext.createScriptProcessor(
                4096,
                1,
                1
              );

              state.inputNode.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Prevent feedback: Silence the output buffer explicitly
                // (ScriptProcessor might pass input to output by default in some browsers if not handled)
                const outputData = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < outputData.length; i++) {
                  outputData[i] = 0;
                }

                // Mute Logic for Input to Model: If muted, fill input buffer with zeros
                if (refs.current.muted) {
                  for (let i = 0; i < inputData.length; i++) {
                    inputData[i] = 0;
                  }
                }

                // Calculate levels for visualizer
                let sum = 0;
                for (let i = 0; i < inputData.length; i++)
                  sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                refs.current.onAudioLevel(rms);

                const pcmBlob = createPcmBlob(inputData);

                if (state.sessionPromise) {
                  state.sessionPromise
                    .then((session) => {
                      if (state.isInterrupted) return;
                      session.sendRealtimeInput({ media: pcmBlob });
                    })
                    .catch((e) => console.error("Session send error", e));
                }
              };

              state.sourceNode.connect(state.inputNode);
              state.inputNode.connect(state.inputAudioContext.destination);
            },
            onmessage: handleMessage,
            onclose: () => {
              refs.current.onStatusChange("disconnected");
            },
            onerror: (e) => {
              console.error("Gemini Live Error:", e);
              refs.current.onError(e.message || "Connection error");
              refs.current.onStatusChange("error");
            },
          },
          config: {
            responseModalities: ["AUDIO"], // Use string literal for safety
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
            systemInstruction: systemInstructionText,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        });
      } catch (err) {
        console.error("Connection failed:", err);
        currentRefs.onError(err.message);
        currentRefs.onStatusChange("error");
      }
    },
    [stopAllAudioOutput]
  );

  return { connect, disconnect };
};
