/**
 * Simulation Logger UI Component
 * Displays simulation logs with filtering and export features
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
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

// Styled Components
const FloatingButton = styled.button`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 50;
  background: #2563eb;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Modal = styled.div`
  background: #1f2937;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 72rem;
  height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #4b5563;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #4b5563;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  background: #374151;
  border-radius: 0.375rem;
  color: #d1d5db;
`;

const ActionButton = styled.button<{
  $variant?: "primary" | "success" | "danger" | "secondary";
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; }
        `;
      case "success":
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
        `;
      case "danger":
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
      default:
        return `
          background: #6b7280;
          color: white;
          &:hover { background: #4b5563; }
        `;
    }
  }}
`;

const FiltersSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #4b5563;
  background: #374151;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #6b7280;
  border-radius: 0.5rem;
  background: #1f2937;
  color: white;
  margin-bottom: 0.75rem;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const FilterRow = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #d1d5db;
  margin-right: 0.5rem;
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$active
      ? `
    background: ${props.$color || "#3b82f6"};
    color: white;
  `
      : `
    background: #4b5563;
    color: #d1d5db;
    &:hover {
      background: #6b7280;
    }
  `}
`;

const AutoScrollContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #d1d5db;
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: #3b82f6;
  }
`;

const LogCount = styled.span`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const LogContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  background: #111827;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #374151;
  }

  &::-webkit-scrollbar-thumb {
    background: #6b7280;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #9ca3af;
  padding: 2rem;
`;

const LogEntry = styled.div`
  margin-bottom: 0.25rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border-left: 2px solid transparent;
  transition: all 0.15s;

  &:hover {
    background: #1f2937;
    border-left-color: #3b82f6;
  }
`;

const LogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const LogTick = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
`;

const LogTimestamp = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
`;

const LogCategoryBadge = styled.span<{ $category: LogCategory }>`
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;

  ${(props) => {
    const colors = {
      [LogCategory.POPULATION]: "background: #1e3a8a; color: #93c5fd;",
      [LogCategory.CREATURE_LIFE]: "background: #581c87; color: #c084fc;",
      [LogCategory.FEEDING]: "background: #14532d; color: #86efac;",
      [LogCategory.COMBAT]: "background: #7f1d1d; color: #fca5a5;",
      [LogCategory.REPRODUCTION]: "background: #831843; color: #f9a8d4;",
      [LogCategory.BRAIN]: "background: #312e81; color: #a5b4fc;",
      [LogCategory.ENVIRONMENT]: "background: #374151; color: #d1d5db;",
      [LogCategory.CARRION]: "background: #78350f; color: #fbbf24;",
      [LogCategory.SYSTEM]: "background: #1e293b; color: #cbd5e1;",
    };
    return colors[props.$category];
  }}
`;

const LogLevelBadge = styled.span<{ $level: LogLevel }>`
  font-size: 0.75rem;

  ${(props) => {
    const colors = {
      [LogLevel.DEBUG]: "color: #6b7280;",
      [LogLevel.INFO]: "color: #3b82f6;",
      [LogLevel.SUCCESS]: "color: #10b981;",
      [LogLevel.WARNING]: "color: #f59e0b;",
      [LogLevel.ERROR]: "color: #ef4444;",
      [LogLevel.CRITICAL]: "color: #dc2626; font-weight: bold;",
    };
    return colors[props.$level];
  }}
`;

const LogMessage = styled.div`
  margin-left: 0.5rem;
  color: #e5e7eb;
`;

const ScrollAnchor = styled.div`
  height: 1px;
`;

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "#6b7280",
  [LogLevel.INFO]: "#3b82f6",
  [LogLevel.SUCCESS]: "#10b981",
  [LogLevel.WARNING]: "#f59e0b",
  [LogLevel.ERROR]: "#ef4444",
  [LogLevel.CRITICAL]: "#dc2626",
};

const CATEGORY_COLORS: Record<LogCategory, string> = {
  [LogCategory.POPULATION]: "#1e3a8a",
  [LogCategory.CREATURE_LIFE]: "#581c87",
  [LogCategory.FEEDING]: "#14532d",
  [LogCategory.COMBAT]: "#7f1d1d",
  [LogCategory.REPRODUCTION]: "#831843",
  [LogCategory.BRAIN]: "#312e81",
  [LogCategory.ENVIRONMENT]: "#374151",
  [LogCategory.CARRION]: "#78350f",
  [LogCategory.SYSTEM]: "#1e293b",
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

  // Wrap updateLogs in useCallback to prevent infinite loops
  const updateLogs = useCallback(() => {
    const currentFilter: LogFilter = {
      levels: Array.from(selectedLevels),
      categories: Array.from(selectedCategories),
      searchTerm: searchTerm || undefined,
      maxEntries: filter.maxEntries,
    };

    const filteredLogs = simulationLogger.getLogs(currentFilter);
    setLogs(filteredLogs);
  }, [selectedLevels, selectedCategories, searchTerm, filter.maxEntries]);

  // Use ref to prevent dependency issues
  const updateLogsRef = useRef(updateLogs);
  updateLogsRef.current = updateLogs;

  // Subscribe to log updates with stable reference
  useEffect(() => {
    const handleLogUpdate = () => {
      // Use ref to avoid dependency issues
      updateLogsRef.current();
    };

    const unsubscribe = simulationLogger.subscribe(handleLogUpdate);

    // Initial load
    updateLogsRef.current();

    return unsubscribe;
  }, []); // Empty dependency array

  // Auto-scroll to bottom when new logs arrive, but only if user is near bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current && logContainerRef.current) {
      const container = logContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [logs, autoScroll]);

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
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setAutoScroll(isNearBottom);
    }
  };

  if (!isOpen) {
    return (
      <FloatingButton onClick={onToggle}>
        📋 Open Logs ({logs.length})
      </FloatingButton>
    );
  }

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>Simulation Logs</Title>
          <HeaderActions>
            {exportStatus && <StatusBadge>{exportStatus}</StatusBadge>}
            <ActionButton $variant="primary" onClick={handleExportClipboard}>
              📋 Copy
            </ActionButton>
            <ActionButton $variant="success" onClick={handleExportJSON}>
              💾 JSON
            </ActionButton>
            <ActionButton $variant="danger" onClick={clearLogs}>
              🗑️ Clear
            </ActionButton>
            <ActionButton onClick={onToggle}>✕ Close</ActionButton>
          </HeaderActions>
        </Header>

        <FiltersSection>
          <SearchInput
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FilterRow>
            <FilterLabel>Levels:</FilterLabel>
            <FilterButtons>
              {Object.values(LogLevel).map((level) => (
                <FilterButton
                  key={level}
                  $active={selectedLevels.has(level)}
                  $color={LOG_LEVEL_COLORS[level]}
                  onClick={() => toggleLevel(level)}
                >
                  {level.toUpperCase()}
                </FilterButton>
              ))}
            </FilterButtons>
          </FilterRow>

          <FilterRow>
            <FilterLabel>Categories:</FilterLabel>
            <FilterButtons>
              {Object.values(LogCategory).map((category) => (
                <FilterButton
                  key={category}
                  $active={selectedCategories.has(category)}
                  $color={CATEGORY_COLORS[category]}
                  onClick={() => toggleCategory(category)}
                >
                  {category.replace("_", " ")}
                </FilterButton>
              ))}
            </FilterButtons>
          </FilterRow>

          <AutoScrollContainer>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll to bottom
            </CheckboxLabel>
            <LogCount>Showing {logs.length} logs</LogCount>
          </AutoScrollContainer>
        </FiltersSection>

        <LogContainer ref={logContainerRef} onScroll={handleScroll}>
          {logs.length === 0 ? (
            <EmptyState>No logs match your filters</EmptyState>
          ) : (
            logs.map((log) => (
              <LogEntry key={log.id}>
                <LogMeta>
                  <LogTick>T{log.tick.toString().padStart(4, "0")}</LogTick>
                  <LogTimestamp>{formatTimestamp(log.timestamp)}</LogTimestamp>
                  <LogCategoryBadge $category={log.category}>
                    {log.category.replace("_", " ")}
                  </LogCategoryBadge>
                  <LogLevelBadge $level={log.level}>
                    {log.level.toUpperCase()}
                  </LogLevelBadge>
                </LogMeta>
                <LogMessage>
                  <span style={{ marginRight: "0.5rem" }}>{log.icon}</span>
                  {log.message}
                </LogMessage>
              </LogEntry>
            ))
          )}
          <ScrollAnchor ref={logsEndRef} />
        </LogContainer>
      </Modal>
    </Overlay>
  );
};
