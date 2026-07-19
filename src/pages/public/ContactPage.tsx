export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 space-y-10">
      <div>
        <p className="text-nexus-textMuted text-xs uppercase tracking-widest mb-3">Talk to us</p>
        <h1 className="font-display text-4xl font-bold text-nexus-text">Get in Touch</h1>
        <p className="text-nexus-textMuted mt-3">We respond to qualified enquiries within one business day.</p>
      </div>
      <form className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['First Name','Last Name'].map(f=>(
            <div key={f} className="flex flex-col gap-1.5">
              <label className="text-nexus-textMuted text-xs uppercase tracking-widest">{f}</label>
              <input className="bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-nexus-text text-sm focus:outline-none focus:border-nexus-accent transition-colors" />
            </div>
          ))}
        </div>
        {['Company','Email Address'].map(f=>(
          <div key={f} className="flex flex-col gap-1.5">
            <label className="text-nexus-textMuted text-xs uppercase tracking-widest">{f}</label>
            <input className="bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-nexus-text text-sm focus:outline-none focus:border-nexus-accent transition-colors" />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className="text-nexus-textMuted text-xs uppercase tracking-widest">Message</label>
          <textarea rows={5} className="bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-nexus-text text-sm focus:outline-none focus:border-nexus-accent transition-colors resize-none" />
        </div>
        <button type="submit" className="btn-gold w-full py-3">Send Message</button>
      </form>
    </div>
  )
}
