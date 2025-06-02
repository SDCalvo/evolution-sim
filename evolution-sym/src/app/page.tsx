"use client";

import styled from "styled-components";
import Link from "next/link";

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #1e3a8a 50%, #581c87 100%);
  color: white;
`;

const InnerContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 2rem;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #60a5fa, #a78bfa);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;

  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #d1d5db;
  max-width: 32rem;
  margin: 0 auto;
  line-height: 1.6;
`;

const MainContent = styled.main`
  max-width: 64rem;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FeatureCard = styled.div`
  background: rgba(31, 41, 55, 0.5);
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #4b5563;
  backdrop-filter: blur(10px);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureTitle = styled.h2<{ $color: string }>`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${(props) => props.$color};
`;

const FeatureDescription = styled.p`
  color: #d1d5db;
  line-height: 1.6;
  margin: 0;
`;

const CallToActionSection = styled.div`
  text-align: center;
  background: rgba(31, 41, 55, 0.3);
  border-radius: 0.5rem;
  padding: 2rem;
  border: 1px solid #6b7280;
  backdrop-filter: blur(5px);
`;

const CTATitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
`;

const CTADescription = styled.p`
  color: #d1d5db;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ProgressList = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 1.5rem;

  p {
    margin: 0.25rem 0;
    line-height: 1.4;
  }
`;

const LaunchButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(to right, #2563eb, #7c3aed);
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.3s;
  transform: scale(1);

  &:hover {
    background: linear-gradient(to right, #1d4ed8, #6d28d9);
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default function Home() {
  return (
    <Container>
      <InnerContainer>
        <Header>
          <Title>Evolution Simulation</Title>
          <Subtitle>
            Watch neural networks evolve through natural selection as creatures
            compete for survival in a 2D environment
          </Subtitle>
        </Header>

        <MainContent>
          <FeatureGrid>
            <FeatureCard>
              <FeatureTitle $color="#60a5fa">🧠 Neural Networks</FeatureTitle>
              <FeatureDescription>
                Each creature has its own neural network that controls behavior.
                Networks are built from scratch to help you understand how they
                work.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureTitle $color="#10b981">🧬 Genetic Evolution</FeatureTitle>
              <FeatureDescription>
                Successful creatures reproduce and pass their neural networks to
                offspring, with mutations introducing variation for evolution.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureTitle $color="#a78bfa">🌍 Environment</FeatureTitle>
              <FeatureDescription>
                A 2D world with food, obstacles, and physics where creatures
                must survive and compete for limited resources.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureTitle $color="#fbbf24">
                📊 Evolution Tracking
              </FeatureTitle>
              <FeatureDescription>
                Visualize fitness improvements, population dynamics, and
                behavioral changes across generations.
              </FeatureDescription>
            </FeatureCard>
          </FeatureGrid>

          <CallToActionSection>
            <CTATitle>🎉 Ready to Explore!</CTATitle>
            <CTADescription>
              Our evolution simulation is now live! Watch AI creatures with
              neural network brains evolve through natural selection in a
              digital ecosystem.
            </CTADescription>
            <ProgressList>
              <p>✅ Phase 1: Project Setup</p>
              <p>✅ Phase 2: Neural Networks from Scratch</p>
              <p>✅ Phase 3: Creatures & Environment</p>
              <p>✅ Phase 4: Real-time Visualization</p>
              <p>🔄 Phase 5: Advanced Evolution Features</p>
            </ProgressList>
            <LaunchButton href="/simulation">🚀 Launch Simulation</LaunchButton>
          </CallToActionSection>
        </MainContent>
      </InnerContainer>
    </Container>
  );
}
