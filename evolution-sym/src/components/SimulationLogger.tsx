/**
 * Simulation Logger UI Component
 * Displays simulation logs with filtering and export features
 */

import React, { useState, useEffect, useRef } from "react";
import {
  simulationLogger,
  SimulationLogEntry,
  LogLevel,
  LogCategory,
  LogFilter,
} from "../lib/logging/simulationLogger";

interface SimulationLoggerProps {
  isOpen: boolean;
  onToggle: () => void;
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "text-gray-500",
  [LogLevel.INFO]: "text-blue-600",
  [LogLevel.SUCCESS]: "text-green-600",
  [LogLevel.WARNING]: "text-yellow-600",
  [LogLevel.ERROR]: "text-red-600",
  [LogLevel.CRITICAL]: "text-red-800 font-bold",
};

const CATEGORY_COLORS: Record<LogCategory, string> = {
  [LogCategory.POPULATION]: "bg-blue-100 text-blue-800",
  [LogCategory.CREATURE_LIFE]: "bg-purple-100 text-purple-800",
  [LogCategory.FEEDING]: "bg-green-100 text-green-800",
  [LogCategory.COMBAT]: "bg-red-100 text-red-800",
  [LogCategory.REPRODUCTION]: "bg-pink-100 text-pink-800",
  [LogCategory.BRAIN]: "bg-indigo-100 text-indigo-800",
  [LogCategory.ENVIRONMENT]: "bg-gray-100 text-gray-800",
  [LogCategory.CARRION]: "bg-yellow-100 text-yellow-800",
  [LogCategory.SYSTEM]: "bg-slate-100 text-slate-800",
};

export const SimulationLoggerComponent: React.FC<SimulationLoggerProps> = ({
  isOpen,
  onToggle,
}) => {
  const [logs, setLogs] = useState<SimulationLogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({ maxEntries: 200 });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<Set<LogLevel>>(
    new Set(Object.values(LogLevel))
  );
  const [selectedCategories, setSelectedCategories] = useState<
    Set<LogCategory>
  >(new Set(Object.values(LogCategory)));
  const [autoScroll, setAutoScroll] = useState(true);
  const [exportStatus, setExportStatus] = useState<string>("");

  const logsEndRef = useRef<HTMLDivElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to log updates
  useEffect(() => {
    const unsubscribe = simulationLogger.subscribe(() => {
      updateLogs();
    });

    // Initial load
    updateLogs();

    return unsubscribe;
  }, []);

  // Update logs when filters change
  useEffect(() => {
    updateLogs();
  }, [selectedLevels, selectedCategories, searchTerm]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const updateLogs = () => {
    const currentFilter: LogFilter = {
      levels: Array.from(selectedLevels),
      categories: Array.from(selectedCategories),
      searchTerm: searchTerm || undefined,
      maxEntries: filter.maxEntries,
    };

    const filteredLogs = simulationLogger.getLogs(currentFilter);
    setLogs(filteredLogs);
  };

  const toggleLevel = (level: LogLevel) => {
    const newLevels = new Set(selectedLevels);
    if (newLevels.has(level)) {
      newLevels.delete(level);
    } else {
      newLevels.add(level);
    }
    setSelectedLevels(newLevels);
  };

  const toggleCategory = (category: LogCategory) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const handleExportClipboard = async () => {
    try {
      const currentFilter: LogFilter = {
        levels: Array.from(selectedLevels),
        categories: Array.from(selectedCategories),
        searchTerm: searchTerm || undefined,
      };

      await simulationLogger.exportToClipboard(currentFilter);
      setExportStatus("✅ Copied to clipboard!");
      setTimeout(() => setExportStatus(""), 2000);
    } catch (error) {
      setExportStatus("❌ Failed to copy");
      setTimeout(() => setExportStatus(""), 2000);
    }
  };

  const handleExportJSON = () => {
    try {
      const currentFilter: LogFilter = {
        levels: Array.from(selectedLevels),
        categories: Array.from(selectedCategories),
        searchTerm: searchTerm || undefined,
      };

      const jsonData = simulationLogger.exportAsJSON(currentFilter);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulation-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus("✅ JSON downloaded!");
      setTimeout(() => setExportStatus(""), 2000);
    } catch (error) {
      setExportStatus("❌ Export failed");
      setTimeout(() => setExportStatus(""), 2000);
    }
  };

  const clearLogs = () => {
    simulationLogger.clear();
    setLogs([]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setAutoScroll(isNearBottom);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          📋 Open Logs ({logs.length})
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Simulation Logs</h2>
          <div className="flex items-center gap-2">
            {exportStatus && (
              <span className="text-sm px-2 py-1 bg-gray-100 rounded">
                {exportStatus}
              </span>
            )}
            <button
              onClick={handleExportClipboard}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              📋 Copy
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              💾 JSON
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              🗑️ Clear
            </button>
            <button
              onClick={onToggle}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Level Filters */}
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Levels:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.values(LogLevel).map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedLevels.has(level)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Categories:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.values(LogCategory).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedCategories.has(category)
                      ? CATEGORY_COLORS[category]
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {category.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-scroll toggle */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll to bottom
            </label>
            <span className="text-sm text-gray-500">
              Showing {logs.length} logs
            </span>
          </div>
        </div>

        {/* Log Container */}
        <div
          ref={logContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        >
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs match your filters
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="mb-1 py-1 px-2 rounded hover:bg-gray-50 border-l-2 border-transparent hover:border-blue-300"
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-xs">
                    T{log.tick.toString().padStart(4, "0")}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span
                    className={`text-xs px-1 rounded ${
                      CATEGORY_COLORS[log.category]
                    }`}
                  >
                    {log.category.replace("_", " ")}
                  </span>
                  <span className={`text-xs ${LOG_LEVEL_COLORS[log.level]}`}>
                    {log.level.toUpperCase()}
                  </span>
                </div>
                <div className="ml-2 mt-1">
                  <span className="mr-2">{log.icon}</span>
                  <span className={LOG_LEVEL_COLORS[log.level]}>
                    {log.message}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
