import MinimalHero from '@/components/mvpblocks/minimal-hero'
import FeaturesSection from '@/components/mvpblocks/features-section'
import HowItWorksSection from '@/components/mvpblocks/how-it-works'
import ValuePropositionSection from '@/components/mvpblocks/value-proposition'
import PricingSection from '@/components/mvpblocks/pricing-section'
import FooterSection from '@/components/mvpblocks/footer-section'
import React from 'react'

const page = () => {
  return (
    <div>
      <MinimalHero />
      <FeaturesSection />
      <HowItWorksSection />
      <ValuePropositionSection />
      <PricingSection />
      <FooterSection />
    </div>
  )
}

export default page