import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import logo from './assets/main_logo.png'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Clock, ChevronDown } from 'lucide-react'
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
    source: '',
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
          source: formData.source,
          consent: formData.consent
        }])

      if (error) throw error

      // Send Confirmation Email
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

      toast.success('Invitation accepted successfully!')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        organisation: '',
        source: '',
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
          <div className="absolute inset-0 bg-black/80 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-deep-green via-transparent to-transparent z-10"></div>
          <img
            src="/assets/images/fellowship-bg.png"
            alt="Office background"
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
                <img src={logo} alt="Fellowship Logo" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
              </motion.div>

            </div>

            {/* Main Hero Content */}
            <div className="max-w-xl">
              <div className="mb-8"><div className="badge-pill"><div className="dot"></div><span>Launch Event</span></div></div>
              <h1 className="text-[40px] md:text-headline-lg lg:text-headline-xl font-display mb-8 leading-[0.9] tracking-tight">
                The <span className="italic text-gold">Fellowship</span> <br />
                <span className="opacity-90">Begins.</span>
              </h1>
              <p className="text-body max-w-sm mb-12 text-white">Join us for the official launch of the D.A. Twum Jnr. Fellowship — an evening honouring a pioneer and marking a new chapter for creative talent.</p>
              <div className="space-y-4 text-white">
                <div className="detail-item"><Calendar size={14} className="icon" /><span>9th April 2026</span></div>
                <div className="detail-item"><Clock size={14} className="icon" /><span>15:30 GMT</span></div>
                <div className="detail-item"><MapPin size={14} className="icon" /><span>Labadi Beach Hotel, Accra</span></div>
              </div>
            </div>
          </div>
          <div className="mt-16 md:mt-0">
            <div className="w-12 h-[1px] bg-gold/30 mb-4"></div>
            <p className="text-fine opacity-20 uppercase tracking-[0.2em]">Innovating with purpose.</p>
          </div>
        </div>

        {/* Mobile RSVP Trigger */}
        {isMobile && !isFormOpen && (
          <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={() => setIsFormOpen(true)} className="fixed bottom-8 left-8 right-8 z-50 btn-primary shadow-2xl">
            Accept Invitation
          </motion.button>
        )}
      </div>

      {/* RIGHT PANEL: REGISTRATION */}
      <motion.div
        className={`w-full md:w-1/2 bg-panel-green min-h-screen relative z-40 flex flex-col p-8 md:p-14 lg:p-16 
          ${isMobile ? (isFormOpen ? 'fixed inset-0 overflow-y-auto' : 'hidden') : 'static'}`}
        initial={isMobile ? { y: '100%' } : false}
        animate={isMobile && isFormOpen ? { y: 0 } : false}
      >
        {/* Mobile Close */}
        {isMobile && (
          <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 text-gold-muted hover:text-gold z-50"><X size={24} /></button>
        )}

        <div className="max-w-2xl mx-auto w-full relative pt-4">
          <div className="flex items-center justify-end gap-3 mb-8">
            <div className="flex-1 h-[1px] bg-gold opacity-10"></div>
            <p className="text-xs font-bold tracking-[0.4em] text-gold uppercase whitespace-nowrap">RSVP</p>
          </div>

          <h2 className="text-5xl md:text-6xl font-display mb-3 leading-tight">
            You're <span className="text-accent-italic text-gold italic">invited.</span>
          </h2>
          <p className="text-[11px] opacity-40 mb-10 font-body tracking-wide">
            Fill in your details below. Takes less than 2 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">

            {/* SECTION 1: YOUR DETAILS */}
            <div className="space-y-6">
              <div className="divider-label"><span className="text-section-label">Your Details</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label>Full Name</label><span className="text-gold text-[10px]">*</span></div>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} required type="text" placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label>Email Address</label><span className="text-gold text-[10px]">*</span></div>
                  <input name="email" value={formData.email} onChange={handleInputChange} required type="email" placeholder="you@email.com" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label>Phone Number</label><span className="optional">Optional</span></div>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+233 XX XXX XXXX" />
                  <p className="text-[8px] opacity-20 tracking-tighter">For WhatsApp event updates only.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><label>City / Region</label><span className="text-gold text-[10px]">*</span></div>
                  <input name="city" value={formData.city} onChange={handleInputChange} required type="text" placeholder="e.g. Accra" />
                </div>
              </div>
            </div>

            {/* SECTION 2: YOUR BACKGROUND */}
            <div className="space-y-6">
              <div className="divider-label"><span className="text-section-label">Your Background</span></div>
              <div className="space-y-2 col-span-full">
                <div className="flex justify-between items-center"><label>Organisation</label><span className="text-gold text-[10px]">*</span></div>
                <input name="organisation" value={formData.organisation} onChange={handleInputChange} required type="text" placeholder="Company, university, or agency" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><label>How did you hear about this event?</label></div>
                <select name="source" className='text-white' value={formData.source} onChange={handleInputChange}>
                  <option value="" disabled>Select one</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Direct Invite">Direct Invite</option>
                  <option value="Word of Mouth">Word of Mouth</option>
                  <option value="Ninani Group Website">Ninani Group Website</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>


            {/* CONSENT AND SUBMIT */}
            <div className="space-y-8 pt-4">
              <label className="flex items-start gap-4 p-6 border border-border-green/20 bg-deep-green/30 cursor-pointer group">
                <input type="checkbox" checked={formData.consent} onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))} />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold tracking-wide group-hover:text-gold transition-colors">I agree to receive communications from The Ninani Group.</p>
                  <p className="text-[9px] leading-relaxed opacity-30 font-light">
                    By registering, you consent to being contacted by email (and optionally WhatsApp) about this event and future Ninani Group activities. You can unsubscribe at any time. We will never share your data with third parties outside The Ninani Group.
                  </p>
                </div>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-px bg-border-green/20">
                <button type="submit" disabled={loading} className="btn-primary sm:flex-[2] py-6 tracking-[0.3em]">
                  {loading ? 'Processing...' : 'Accept Invitation'}
                </button>
                <div className="bg-panel-green sm:flex-1 p-4 sm:p-6 text-center sm:text-left flex items-center">
                  <p className="text-[8px] opacity-30 leading-relaxed tracking-wide uppercase font-medium">
                    Your details are handled securely and never sold.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default App
