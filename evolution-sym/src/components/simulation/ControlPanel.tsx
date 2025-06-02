"use client";

import React from "react";
import styled from "styled-components";
import { SimpleSimulationStats } from "../../lib/simulation/simpleSimulation";

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  stats?: SimpleSimulationStats;
}

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const InfoIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  color: #60a5fa;
  cursor: help;
  transition: color 0.2s;

  &:hover {
    color: #93c5fd;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Button = styled.button<{ variant: "primary" | "secondary" | "danger" }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
  transform: scale(1);
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.02);
  }

  ${(props) => {
    switch (props.variant) {
      case "danger":
        return `
          background: #dc2626;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.25);
          
          &:hover {
            background: #b91c1c;
          }
        `;
      case "primary":
        return `
          background: #059669;
          color: white;
          box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.25);
          
          &:hover {
            background: #047857;
          }
        `;
      case "secondary":
        return `
          background: #4b5563;
          color: white;
          
          &:hover {
            background: #374151;
          }
        `;
      default:
        return "";
    }
  }}
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StatusCard = styled.div`
  background: #374151;
  border-radius: 0.5rem;
  padding: 0.75rem;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div<{ isRunning: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: ${(props) => (props.isRunning ? "#10b981" : "#ef4444")};

  ${(props) =>
    props.isRunning &&
    `
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `}
`;

const StatusText = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
`;

const TickText = styled.span`
  color: #9ca3af;
  font-size: 0.75rem;
`;

const PerformanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PerformanceLabel = styled.span`
  color: #d1d5db;
  font-size: 0.875rem;
`;

const PerformanceValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PerformanceIndicator = styled.div<{ ups: number }>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: ${(props) =>
    props.ups > 25 ? "#10b981" : props.ups > 15 ? "#f59e0b" : "#ef4444"};
`;

const PerformanceText = styled.span`
  color: white;
  font-family: "Courier New", monospace;
  font-size: 0.875rem;
`;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onToggleRunning,
  onReset,
  stats,
}) => {
  return (
    <Container>
      <Header>
        <Title>🎮 Controls</Title>
        <InfoIcon title="Simulation Controls - Start/Pause: Begin or halt evolution, Reset: Generate new random population, Status indicator shows current state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </InfoIcon>
      </Header>

      <ButtonContainer>
        <Button
          variant={isRunning ? "danger" : "primary"}
          onClick={onToggleRunning}
        >
          {isRunning ? "⏸️ Pause Simulation" : "▶️ Start Evolution"}
        </Button>

        <Button variant="secondary" onClick={onReset}>
          🔄 Reset Population
        </Button>
      </ButtonContainer>

      {stats && (
        <StatusSection>
          <StatusCard>
            <StatusRow>
              <StatusLeft>
                <StatusIndicator isRunning={isRunning} />
                <StatusText>{isRunning ? "Running" : "Paused"}</StatusText>
              </StatusLeft>
              <TickText>Tick #{stats.currentTick}</TickText>
            </StatusRow>
          </StatusCard>

          <StatusCard>
            <PerformanceRow>
              <PerformanceLabel>Performance:</PerformanceLabel>
              <PerformanceValue>
                <PerformanceIndicator ups={stats.updatesPerSecond} />
                <PerformanceText>
                  {stats.updatesPerSecond.toFixed(1)} UPS
                </PerformanceText>
              </PerformanceValue>
            </PerformanceRow>
          </StatusCard>
        </StatusSection>
      )}
    </Container>
  );
};
