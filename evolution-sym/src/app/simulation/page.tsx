"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { SimulationCanvas } from "../../components/simulation/SimulationCanvas";
import { ControlPanel } from "../../components/simulation/ControlPanel";
import { SimulationLoggerComponent } from "../../components/SimulationLogger";
import {
  SimpleSimulationConfig,
  SimpleSimulationStats,
} from "../../lib/simulation/simpleSimulation";

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #1e3a8a 50%, #7c3aed 100%);
`;

const InnerContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
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

const Subtitle = styled.p`
  color: #d1d5db;
  font-size: 1.125rem;
  margin: 0;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const CanvasSection = styled.div`
  background: #1f2937;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #4b5563;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const Legend = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
`;

const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ColorDot = styled.div<{ color: string }>`
  width: 0.75rem;
  height: 0.75rem;
  background-color: ${(props) => props.color};
  border-radius: 50%;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled.div`
  background: #1f2937;
  border-radius: 0.75rem;
  border: 1px solid #4b5563;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.75rem;
`;

const StatCard = styled.div`
  background: #374151;
  border-radius: 0.375rem;
  padding: 0.5rem;
`;

const StatLabel = styled.div`
  color: #9ca3af;
  margin-bottom: 0.125rem;
`;

const StatValue = styled.div`
  color: white;
  font-weight: 600;
`;

const Button = styled.button`
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const ConfigRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ConfigLabel = styled.span`
  color: #9ca3af;
`;

const ConfigValue = styled.span`
  color: white;
  font-weight: 500;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #d1d5db;
`;

const FeatureIcon = styled.span<{ status: "active" | "pending" }>`
  color: ${(props) => (props.status === "active" ? "#10b981" : "#f59e0b")};
  font-size: 0.875rem;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
`;

export default function SimulationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<SimpleSimulationStats | undefined>();
  const [canvasKey, setCanvasKey] = useState(0);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);

  const config: SimpleSimulationConfig = {
    initialPopulation: 10,
    maxPopulation: 50,
    worldWidth: 600,
    worldHeight: 600,
    targetFPS: 30,
  };

  const handleToggleRunning = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStats(undefined);
    setCanvasKey((prev) => prev + 1);
  };

  const handleStatsUpdate = (newStats: SimpleSimulationStats) => {
    setStats(newStats);
  };

  const handleToggleLogger = () => {
    setIsLoggerOpen(!isLoggerOpen);
  };

  return (
    <Container>
      <InnerContainer>
        <Header>
          <TitleContainer>
            <Title>🧬 Evolution Simulation</Title>
            <InfoIcon title="AI Evolution Simulation - Creatures have neural network brains, 14 genetic traits control behavior, natural selection drives evolution, real-time ecosystem dynamics">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </InfoIcon>
          </TitleContainer>
          <Subtitle>
            Watch AI creatures evolve through natural selection
          </Subtitle>
        </Header>

        <MainGrid>
          <CanvasSection>
            <SectionHeader>
              <SectionTitle>🌍 Digital Ecosystem</SectionTitle>
              <InfoIcon title="Visual Guide - Blue creatures (color = genetics), Green plant food (stationary), Yellow small prey (moving), Brown carrion (decaying remains), White energy glow around creatures, Purple AI thought bubbles">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </InfoIcon>
            </SectionHeader>

            <SimulationCanvas
              key={canvasKey}
              width={config.worldWidth}
              height={config.worldHeight}
              config={config}
              isRunning={isRunning}
              onStatsUpdate={handleStatsUpdate}
            />

            <Legend>
              <LegendItem>
                <ColorDot color="#3b82f6" />
                Creatures
              </LegendItem>
              <LegendItem>
                <ColorDot color="#10b981" />
                Plant Food
              </LegendItem>
              <LegendItem>
                <ColorDot color="#eab308" />
                Small Prey
              </LegendItem>
              <LegendItem>
                <ColorDot color="#a16207" />
                Carrion
              </LegendItem>
            </Legend>
          </CanvasSection>

          <Sidebar>
            <Card>
              <ControlPanel
                isRunning={isRunning}
                onToggleRunning={handleToggleRunning}
                onReset={handleReset}
                stats={stats}
              />
            </Card>

            {stats && (
              <Card>
                <CardContent>
                  <SectionHeader>
                    <CardTitle>📊 Live Stats</CardTitle>
                    <InfoIcon title="Real-time Metrics - Population: Living creatures, Fitness: Average creature fitness, Food: Available nutrition items, UPS: Updates per second (performance)">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </InfoIcon>
                  </SectionHeader>
                  <StatsGrid>
                    <StatCard>
                      <StatLabel>Population</StatLabel>
                      <StatValue>{stats.livingCreatures}</StatValue>
                    </StatCard>
                    <StatCard>
                      <StatLabel>Fitness</StatLabel>
                      <StatValue>{stats.averageFitness.toFixed(1)}</StatValue>
                    </StatCard>
                    <StatCard>
                      <StatLabel>Food Items</StatLabel>
                      <StatValue>{stats.totalFood}</StatValue>
                    </StatCard>
                    <StatCard>
                      <StatLabel>UPS</StatLabel>
                      <StatValue>{stats.updatesPerSecond.toFixed(1)}</StatValue>
                    </StatCard>
                  </StatsGrid>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent>
                <SectionHeader>
                  <CardTitle>📋 Logs</CardTitle>
                  <InfoIcon title="Event Logging - Creature births and deaths, Feeding and combat events, Brain decision analysis, Population dynamics, Debug information">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </InfoIcon>
                </SectionHeader>
                <Button onClick={handleToggleLogger}>
                  {isLoggerOpen ? "Close" : "Open"} Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <SectionHeader>
                  <CardTitle>⚙️ Config</CardTitle>
                  <InfoIcon title="Simulation Parameters - Population: Starting → Maximum, World Size: Canvas dimensions, Target FPS: Simulation speed, Biome: Environmental type">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </InfoIcon>
                </SectionHeader>
                <div>
                  <ConfigRow>
                    <ConfigLabel>Population:</ConfigLabel>
                    <ConfigValue>
                      {config.initialPopulation} → {config.maxPopulation}
                    </ConfigValue>
                  </ConfigRow>
                  <ConfigRow>
                    <ConfigLabel>World:</ConfigLabel>
                    <ConfigValue>
                      {config.worldWidth}×{config.worldHeight}
                    </ConfigValue>
                  </ConfigRow>
                  <ConfigRow>
                    <ConfigLabel>FPS:</ConfigLabel>
                    <ConfigValue>{config.targetFPS}</ConfigValue>
                  </ConfigRow>
                  <ConfigRow>
                    <ConfigLabel>Biome:</ConfigLabel>
                    <ConfigValue style={{ color: "#10b981" }}>
                      Grassland
                    </ConfigValue>
                  </ConfigRow>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <SectionHeader>
                  <CardTitle>🧬 Features</CardTitle>
                  <InfoIcon title="Evolution System - Active Features: Neural network AI brains, 14-trait genetic inheritance, Environmental perception, Carrion scavenging system, Visual species differentiation, Comprehensive event logging. In Development: Sexual reproduction mechanics, Advanced species tracking">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </InfoIcon>
                </SectionHeader>
                <FeatureList>
                  <FeatureItem>
                    <FeatureIcon status="active">✓</FeatureIcon>
                    <span>Neural AI</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="active">✓</FeatureIcon>
                    <span>Genetics</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="active">✓</FeatureIcon>
                    <span>Sensors</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="active">✓</FeatureIcon>
                    <span>Carrion</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="active">✓</FeatureIcon>
                    <span>Logging</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="pending">⏳</FeatureIcon>
                    <span>Sexual Repro</span>
                  </FeatureItem>
                  <FeatureItem>
                    <FeatureIcon status="pending">⏳</FeatureIcon>
                    <span>Species Track</span>
                  </FeatureItem>
                </FeatureList>
              </CardContent>
            </Card>
          </Sidebar>
        </MainGrid>

        <Footer>
          <p>
            Built with Next.js, TypeScript, and Canvas API • Neural networks
            built from scratch
          </p>
        </Footer>
      </InnerContainer>

      <SimulationLoggerComponent
        isOpen={isLoggerOpen}
        onToggle={handleToggleLogger}
      />
    </Container>
  );
}
