import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import logo from './assets/twum_logo.png'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X, Calendar, MapPin, Clock } from 'lucide-react'
import emailjs from '@emailjs/browser'

const App = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    organisation: '',
    consent: false
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.consent) {
      toast.error('Please agree to the communications consent.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          organisation: formData.organisation,
          consent: formData.consent
        }])

      if (error) throw error

      // Send Confirmation Email via EmailJS
      try {
        const templateParams = {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          organisation: formData.organisation
        }

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      } catch (emailError) {
        console.warn('Email confirmation failed to send:', emailError)
      }

      toast.success('Invitation accepted successfully! Check your email for confirmation.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        organisation: '',
        consent: false
      })
      setIsFormOpen(false)
    } catch (error) {
      if (error.code === '23505') {
        toast.error('This email is already registered for the event.')
      } else {
        toast.error(error.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-deep-green text-cream font-body overflow-x-hidden relative no-scrollbar">

      {/* LEFT PANEL: HERO CONTENT */}
      <div className="w-full md:w-1/2 min-h-screen relative flex flex-col justify-between overflow-hidden">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-deep-green via-transparent to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
            alt=""
            className="w-full h-full object-cover scale-110"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-20 flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24">

          <div className="space-y-12 md:space-y-16">
            {/* Top Branding */}
            <div className="flex items-center gap-6 group cursor-default">
              <motion.div
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-16 h-16 md:w-20 md:h-20 relative"
              >
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl animate-pulse"></div>
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Main Hero Content */}
            <div className="max-w-xl">
              <div className="mb-8">
                <div className="badge-pill">
                  <div className="dot"></div>
                  <span>Launch Event</span>
                </div>
              </div>

              <h1 className="text-[40px] md:text-headline-lg lg:text-headline-xl font-display mb-8 leading-[0.9] tracking-tight">
                The <span className="text-accent-italic">Fellowship</span> <br />
                <span className="opacity-90">Begins.</span>
              </h1>

              <p className="text-body max-w-sm mb-12  font-light">
                Join us for the official launch of the D.A. Twum Jnr. Fellowship — an evening honouring a pioneer and marking a new chapter for creative talent.
              </p>

              <div className="space-y-4">
                <div className="detail-item">
                  <Calendar size={14} className="icon" />
                  <span>9th April 2026</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} className="icon" />
                  <span>15:30 GMT</span>
                </div>
                <div className="detail-item">
                  <MapPin size={14} className="icon" />
                  <span>Labadi Beach Hotel, Accra</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-16 md:mt-0">
            <div className="w-12 h-[1px] bg-gold/30 mb-4"></div>
            <p className="text-fine opacity-20 uppercase tracking-[0.2em]">
              Innovating with purpose.
            </p>
          </div>
        </div>

        {/* Mobile RSVP Trigger */}
        {isMobile && !isFormOpen && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setIsFormOpen(true)}
            className="fixed bottom-8 left-0 right-0 z-50 btn-primary shadow-2xl"
          >
            Accept Invitation
          </motion.button>
        )}
      </div>

      {/* RIGHT PANEL: REGISTRATION */}
      <motion.div
        className={`w-full md:w-1/2 bg-panel-green min-h-screen relative z-40 flex flex-col p-8 md:p-16 lg:p-24 
          ${isMobile ? (isFormOpen ? 'fixed inset-0 overflow-y-auto' : 'hidden') : 'static'}`}
        initial={isMobile ? { y: '100%' } : false}
        animate={isMobile && isFormOpen ? { y: 0 } : false}
      >
        {/* Mobile Close */}
        {isMobile && (
          <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 text-gold-muted hover:text-gold transition-colors">
            <X size={24} />
          </button>
        )}

        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-subhead font-display mb-3">Confirm Attendance</h2>
            <p className="text-body opacity-40">Please complete your RSVP details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sec 1: Identity */}
            <div className="space-y-6">
              <div className="divider-label">
                <span className="text-section-label">Identity</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label>Full Name <span className="required">*</span></label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" placeholder="e.g. Ama Mensah" />
                </div>

                <div className="space-y-1.5">
                  <label>Email Address <span className="required">*</span></label>
                  <input name="email" value={formData.email} onChange={handleInputChange} required type="email" placeholder="you@example.com" />
                </div>
              </div>
            </div>

            {/* Sec 2: Contact & Background */}
            <div className="space-y-6">
              <div className="divider-label">
                <span className="text-section-label">Contact & Base</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Phone <span className="optional">(Optional)</span></label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+233..." />
                </div>
                <div className="space-y-1.5">
                  <label>City <span className="required">*</span></label>
                  <input name="city" value={formData.city} onChange={handleInputChange} required type="text" placeholder="Accra" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label>Organisation <span className="required">*</span></label>
                <input name="organisation" value={formData.organisation} onChange={handleInputChange} required type="text" placeholder="Company or Agency" />
              </div>
            </div>

            {/* Sec 3: Consent */}
            <div className="space-y-6">
              <div className="divider-label">
                <span className="text-section-label">Agreement</span>
              </div>

              <label className="flex items-start gap-4 p-4 rounded-md bg-deep-green/50 border border-border-green/30 cursor-pointer group hover:border-gold/30 transition-all">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium leading-tight group-hover:text-gold transition-colors">I agree to receive communications from The Ninani Group.</p>
                  <p className="text-[9px] opacity-30 leading-relaxed">
                    By accepting, you consent to being contacted about this event. You can unsubscribe at any time.
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-6">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Processing...' : 'Accept Invitation'}
              </button>
              <p className="text-fine opacity-20 text-center mt-6 uppercase tracking-widest">
                Verification Required
              </p>
            </div>
          </form>
        </div>

        {/* Side Footer */}
        <footer className="mt-16 text-center md:text-left">
          <p className="text-fine opacity-10 uppercase tracking-widest">
            The Ninani Group © 2026
          </p>
        </footer>
      </motion.div>
    </div>
  )
}

export default App
