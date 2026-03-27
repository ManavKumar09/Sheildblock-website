import './Testimonials.css'

const testimonials = [
  {
    quote: 'ShieldBlock cut my monthly data usage by almost 35%. On a limited data plan in India, that translates to real savings every month.',
    name: 'Arjun Mehta',
    role: 'Engineering Student, Vidisha',
    initials: 'AM',
  },
  {
    quote: 'The cloud DNS mode is perfect for when I\'m traveling. Same protection as my home Pi-hole but accessible from any network.',
    name: 'Rohit Patel',
    role: 'Cybersecurity Analyst, Mumbai',
    initials: 'RP',
  },
  {
    quote: 'As a privacy advocate, I love that ShieldBlock is fully self-hosted. My DNS data never leaves my network. The DPDP Act compliance is a great bonus.',
    name: 'Karan Singh',
    role: 'Privacy Researcher, Delhi',
    initials: 'KS',
  },
  {
    quote: 'Deployed it on a Raspberry Pi 4 at home and forgot about it. My parents\' phones load pages noticeably faster and they don\'t see a single ad anymore.',
    name: 'Priya Sharma',
    role: 'Software Developer, Bangalore',
    initials: 'PS',
  },
  {
    quote: 'We deployed ShieldBlock across our small office network. The centralized analytics dashboard helps us understand traffic patterns and block threats proactively.',
    name: 'Deepika Iyer',
    role: 'IT Administrator, Chennai',
    initials: 'DI',
  },
  {
    quote: 'The live query log is addictive. Seeing exactly which domains are being blocked in real time really opens your eyes to how much tracking happens.',
    name: 'Anita Deshmukh',
    role: 'Data Scientist, Pune',
    initials: 'AD',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials__inner">

        {/* Header */}
        <div className="testimonials__header">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-heading">Trusted by privacy-first users</h2>
          <p className="section-sub">
            From home labs to enterprise networks, ShieldBlock protects thousands of devices across India.
          </p>
        </div>

        {/* Grid */}
        <div className="testimonials__grid">
          {testimonials.map((t, i) => (
            <div className="testi-card" key={i}>
              <p className="testi-card__quote">"{t.quote}"</p>
              <div className="testi-card__author">
                <div className="testi-card__avatar">{t.initials}</div>
                <div>
                  <p className="testi-card__name">{t.name}</p>
                  <p className="testi-card__role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}