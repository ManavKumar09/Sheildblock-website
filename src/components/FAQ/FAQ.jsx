import { useState } from 'react'
import './FAQ.css'

const faqs = [
  {
    question: 'What hardware do I need to self-host ShieldBlock?',
    answer: 'ShieldBlock runs on a Raspberry Pi 3, 4, or 5 with at least 1 GB of RAM. It acts as your local DNS resolver and filtering node. The Pi should be connected to your network via Ethernet for best performance, though Wi-Fi works for smaller setups.',
  },
  {
    question: 'How does DNS-level filtering work?',
    answer: 'When any device on your network tries to access a website, it first sends a DNS query to resolve the domain name. ShieldBlock intercepts these queries and checks them against curated blocklists. If the domain is associated with ads, trackers, or malware, ShieldBlock returns a null address, preventing the connection from ever being established.',
  },
  {
    question: 'Is ad blocking legal in India?',
    answer: 'Yes. The Information Technology Act, 2000 (Section 69A) pertains to government-directed content blocking, not user-controlled filtering. The Digital Personal Data Protection Act, 2023 reinforces a user\'s right to control how their browsing metadata is processed. Personal ad blocking for privacy is not prohibited under current Indian law.',
  },
  {
    question: 'What is the difference between self-hosted and cloud DNS?',
    answer: 'The self-hosted version runs entirely on your Raspberry Pi, meaning your DNS queries never leave your local network. The cloud DNS routes your queries through our global infrastructure, which is useful for mobile networks, traveling, or users who cannot deploy hardware. Both use the same filtering engine and blocklists.',
  },
  {
    question: 'Will ShieldBlock break any websites?',
    answer: 'ShieldBlock is designed to block only advertising and tracking domains without affecting core website functionality. If a site requires you to disable blocking, you can whitelist specific domains through the admin dashboard. The custom allow/deny list feature gives you granular control.',
  },
  {
    question: 'How much data can ShieldBlock save?',
    answer: 'Independent studies show that advertising resources can account for 18-79% of mobile data usage on certain pages. Network-level blocking typically reduces overall data transfer by approximately 30-40% on content-heavy websites. For users on limited data plans in India, this translates to significant monthly savings.',
  },
  {
    question: 'Can ShieldBlock detect obfuscated ad scripts?',
    answer: 'Our current filtering uses curated blocklists and DNS-level interception. Future versions will integrate machine learning techniques to detect obfuscated advertising scripts, identify unknown tracking domains, and automatically update filtering lists based on behavioral pattern classification.',
  },
  {
    question: 'Does ShieldBlock work on mobile networks?',
    answer: 'The self-hosted version protects all devices on your home or office LAN. For mobile (cellular) network protection, use the Cloud DNS mode which provides DNS-over-HTTPS and DNS-over-TLS support that works across any network your device connects to.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section className="faq" id="faq">
      <div className="faq__inner">

        {/* Header */}
        <div className="faq__header">
          <div className="section-tag">FAQ</div>
          <h2 className="section-heading">Frequently asked questions</h2>
        </div>

        {/* Accordion */}
        <div className="faq__list">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}
            >
              <button
                className="faq-item__question"
                onClick={() => toggle(i)}
              >
                <span>{item.question}</span>
                <span className="faq-item__icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
              <div className="faq-item__answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}