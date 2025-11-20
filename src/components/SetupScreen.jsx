import React, { useState } from "react";
import { Briefcase, Building, User } from "lucide-react";

const SetupScreen = ({ onStart }) => {
  const [config, setConfig] = useState({
    title: "Senior React Engineer",
    company: "Tech Corp",
    description: "",
    level: "Senior",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(config);
    onStart(config);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Configure Interview</h1>
          <p className="text-slate-400 mt-2">
            Set up the context for your AI interviewer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Role Title
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  setConfig({ ...config, title: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Product Manager"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={config.company}
                  onChange={(e) =>
                    setConfig({ ...config, company: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Google"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Level
              </label>
              <select
                value={config.level}
                onChange={(e) =>
                  setConfig({ ...config, level: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead / Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Job Description (Optional)
            </label>
            <textarea
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Paste key requirements here to tailor the questions..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            Start Interview
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;
