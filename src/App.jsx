import React, { useState, useEffect } from 'react'
import circles from './assets/circles.png'
import { supabase } from './lib/supabaseClient'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'
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
    role: '',
    source: '',
    preferences: [],
    consent: false
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (preference) => {
    setFormData(prev => {
      const current = prev.preferences
      if (current.includes(preference)) {
        return { ...prev, preferences: current.filter(p => p !== preference) }
      }
      return { ...prev, preferences: [...current, preference] }
    })
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
          role: formData.role,
          source: formData.source,
          preferences: formData.preferences,
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
          organisation: formData.organisation,
          role: formData.role,
          source: formData.source || 'Direct',
          preferences: formData.preferences.join(', ') || 'None'
        }

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      } catch (emailError) {
        console.warn('Email confirmation failed to send:', emailError)
        // We don't throw here so the user still sees their registration was successful
      }

      toast.success('Registration successful! Check your email for confirmation.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        organisation: '',
        role: '',
        source: '',
        preferences: [],
        consent: false
      })
    } catch (error) {
      console.error('Error:', error)
      if (error.code === '23505') {
        toast.error('You have already registered with this email address.')
      } else {
        toast.error(error.message || 'An error occurred during registration. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Reactive Breakpoint Handling
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // If switching to desktop, ensure form state is consistent
      if (!mobile) setIsFormOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`flex flex-col md:flex-row h-full min-h-screen md:h-screen bg-black text-white font-sans overflow-y-auto overflow-x-hidden md:overflow-hidden relative no-scrollbar`}>
      {/* Mobile Drag Handle - Middle Right */}
      {!isFormOpen && (
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFormOpen(true)}
          className="md:hidden fixed top-1/2 right-0 -translate-y-1/2 z-[100] bg-gold text-black py-5 px-1.5 rounded-l-2xl flex flex-col items-center gap-2 shadow-[-4px_0_20px_rgba(0,0,0,0.4)] border-y border-l border-white/20"
        >
          <ChevronLeft size={18} className="animate-pulse" />
          <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black tracking-[0.25em] uppercase">Register</span>
        </motion.button>
      )}

      {/* Left Section: Hero & Event Details */}
      <div className="relative w-full md:w-1/2 min-h-screen md:h-full flex flex-col justify-between">
        {/* Deep Emerald-Black Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/images/fellowship-bg.png)' }}
        >
          <div className="absolute inset-0 bg-[#001a12]/85 md:bg-[#001a12]/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#001a12] via-transparent to-transparent"></div>
        </div>

        {/* Decorative Geometric Asset (Subtle Radar Grid) */}
        <img
          src={circles}
          alt=""
          className="absolute -bottom-20 -right-20 w-[110%] h-auto opacity-[0.02] pointer-events-none select-none"
        />

        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-between p-10 md:p-14 lg:p-20 z-10 md:overflow-hidden">
          {/* Top Branding */}
          {/* <div className="space-y-1 md:mb-14 mb-16">
            <p className="text-[14px] md:text-[11px] tracking-[0.1em] font-medium text-white opacity-90 font-serif">
              The 
D. A. Twum Jnr. Fellowship
            </p>
            <p className="text-[12px] md:text-[9px] tracking-[0.35em] font-bold text-gold uppercase opacity-80">
              The Ninani Group · Ghana
            </p>
          </div> */}

          {/* Main Hero Content */}
          <div className="max-w-xl py-12 md:py-4">
            {/* <div className="flex items-center gap-4 mb-10 translate-x-[-4px]">
              <div className="w-10 h-[0.5px] bg-gold opacity-60"></div>
              <p className="text-[9px] font-bold tracking-[0.5em] text-gold uppercase">Launch Event</p>
              <div className="w-1 h-1 rounded-full bg-gold opacity-80"></div>
            </div> */}

            <h1 className="text-6xl md:text-5xl lg:text-6xl font-serif tracking-tighter mb-10 leading-[0.85] flex flex-col">
              <span className="text-white">The</span>
              <span className="italic text-gold py-1">D. A. Twum Jnr. Fellowship</span>
              <span className="text-white relative inline-block">
                Launch Event.
              </span>
            </h1>

            <p className="text-xs md:text-sm leading-relaxed opacity-40 mb-10 max-w-sm font-sans font-light tracking-wide">
              Join us for the official launch of the D.A. Twum Jnr. Fellowship — an evening honouring a pioneer of Ghanaian advertising and marking the beginning of a new chapter for creative talent in Ghana.
            </p>

            {/* Event Meta Detail Squares - Delicate Scale */}
            <div className="space-y-4">
              <div className="flex items-center gap-6 group">
                <div className="w-7 h-7 border border-gold/30 flex items-center justify-center transition-all group-hover:border-gold">
                  <div className="w-1 h-1 rounded-full bg-gold/50 shadow-[0_0_6px_#bfa36a]"></div>
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-60 transition-opacity"> 9th April 2026 at 15:30 GMT</p>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-7 h-7 border border-gold/30 flex items-center justify-center transition-all group-hover:border-gold">
                  <div className="w-2 h-2 rotate-45 border border-gold/60 transition-colors"></div>
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-60 transition-opacity">Accra, Ghana</p>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-7 h-7 border border-gold/30 flex items-center justify-center transition-all group-hover:border-gold">
                  <div className="w-1.5 h-1.5 rotate-45 bg-gold/30 transition-all group-hover:bg-gold"></div>
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 group-hover:opacity-60 transition-opacity">By The Ninani Group</p>
              </div>
            </div>
          </div>

          {/* Left Panel Footer - Minimalist Privacy */}
          <div className="mt-auto pt-10">
            <div className="w-full h-[0.5px] bg-[#858483] opacity-60 mb-2"></div>
            <p className="text-[8px] opacity-20 leading-relaxed font-sans tracking-[0.1em] text-center md:text-left uppercase">
              Your information is collected solely for event management and agreed communications. You may unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>



      {/* Right Section: Draggable Registration Form */}
      <motion.div
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(e, { offset, velocity }) => {
          if (isMobile && (offset.x > 100 || velocity.x > 500)) setIsFormOpen(false)
          else if (isMobile && (offset.x < -100 || velocity.x < -500)) setIsFormOpen(true)
        }}
        initial={false}
        animate={{
          x: isMobile ? (isFormOpen ? 0 : '100%') : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full md:w-1/2 bg-dark-green h-full overflow-y-auto overflow-x-hidden no-scrollbar p-6 md:p-10 lg:p-12 flex flex-col justify-start fixed md:static top-0 right-0 z-50 md:z-auto shadow-[-20px_0_40px_rgba(0,0,0,0.5)] md:shadow-none"
      >
        {/* Close Button - Mobile Only */}
        <button
          onClick={() => setIsFormOpen(false)}
          className="md:hidden absolute top-1 left-1 w-10 h-10 border border-white/10 flex items-center justify-center rounded-full bg-black/20 text-gold z-50"
        >
          <X size={20} />
        </button>

        {/* Decorative Assets */}
        <img src={circles} alt="" className="absolute -top-16 -left-16 w-64 h-64 opacity-[0.03] pointer-events-none select-none" />
        <img src={circles} alt="" className="absolute -bottom-24 -right-24 w-80 h-80 opacity-[0.05] pointer-events-none select-none rotate-12" />

        <div className="max-w-2xl mx-auto w-full relative z-10 pt-4">
          {/* Top Divider Line (Mockup Detail) */}

          <div className="flex items-center justify-end gap-3 mb-8">
            <div className="flex-1 h-[0.5px] bg-gold opacity-20"></div>
            <p className="text-[9px] font-bold tracking-[0.4em] text-gold uppercase whitespace-nowrap">Register your attendance</p>
          </div>

          <h2 className="text-5xl md:text-6xl font-serif mb-2 leading-tight text-white">
            You're <span className="italic text-gold">invited.</span>
          </h2>
          <p className="text-[11px] opacity-40 mb-10 font-sans tracking-wide">
            Fill in your details below. Takes less than 2 minutes.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* SECTION 1: YOUR DETAILS */}
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
                <p className="text-[9px] font-bold tracking-[0.4em] text-white opacity-80 uppercase whitespace-nowrap">Your Details</p>
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">Full Name</label>
                    <span className="text-gold text-[10px] leading-none opacity-80">*</span>
                  </div>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    type="text"
                    placeholder="Your full name"
                    className="w-full bg-black/30 border border-white/5 p-3.5 text-[11px] focus:outline-none focus:border-gold/30 placeholder:opacity-20 text-white"
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">Email Address</label>
                    <span className="text-gold text-[10px] leading-none opacity-80">*</span>
                  </div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    type="email"
                    placeholder="you@email.com"
                    className="w-full bg-black/30 border border-white/5 p-3.5 text-[11px] focus:outline-none focus:border-gold/30 placeholder:opacity-20 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">Phone Number</label>
                    <span className="text-[8px] uppercase tracking-tighter opacity-30 font-bold">Optional</span>
                  </div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    className="w-full bg-black/30 border border-white/5 p-3.5 text-[11px] focus:outline-none focus:border-gold/30 placeholder:opacity-20 text-white"
                  />
                  <p className="text-[8px] opacity-30 tracking-tight font-medium">For WhatsApp event updates only.</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">City / Region</label>
                    <span className="text-gold text-[10px] leading-none opacity-80">*</span>
                  </div>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    type="text"
                    placeholder="e.g. Accra"
                    className="w-full bg-black/30 border border-white/5 p-3.5 text-[11px] focus:outline-none focus:border-gold/30 placeholder:opacity-20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: YOUR BACKGROUND */}
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
                <p className="text-[9px] font-bold tracking-[0.4em] text-white opacity-80 uppercase whitespace-nowrap">Your Background</p>
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">Organisation</label>
                    <span className="text-gold text-[10px] leading-none opacity-80">*</span>
                  </div>
                  <input
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleInputChange}
                    required
                    type="text"
                    placeholder="Company, university, or agency"
                    className="w-full bg-black/30 border border-white/5 p-3.5 text-[11px] focus:outline-none focus:border-gold/30 placeholder:opacity-20 text-white"
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center group">
                    <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">Your Role</label>
                    <span className="text-gold text-[10px] leading-none opacity-80">*</span>
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="custom-select"
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="agency">Agency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">How did you hear about this event?</label>
                </div>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="custom-select"
                >
                  <option value="" disabled>Select one</option>
                  <option value="social">Social Media</option>
                  <option value="word">Word of Mouth</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            {/* SECTION 3: STAY CONNECTED */}
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
                <p className="text-[9px] font-bold tracking-[0.4em] text-white opacity-80 uppercase whitespace-nowrap">Stay Connected</p>
                <div className="flex-1 h-[0.5px] bg-gold/10"></div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-gold">What would you like to hear from us?</p>
                  <span className="text-[8px] opacity-40 lowercase italic font-normal">Select all that apply</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-4 bg-black/20 border border-white/5 p-3.5 cursor-pointer hover:bg-black/30 transition-all">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={formData.preferences.includes('news')}
                      onChange={() => handleCheckboxChange('news')}
                    />
                    <span className="text-[10px] font-medium opacity-70">Fellowship news & cohort updates</span>
                  </label>
                  <label className="flex items-center gap-4 bg-black/20 border border-white/5 p-3.5 cursor-pointer hover:bg-black/30 transition-all">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={formData.preferences.includes('events')}
                      onChange={() => handleCheckboxChange('events')}
                    />
                    <span className="text-[10px] font-medium opacity-70">Future industry events</span>
                  </label>
                  <label className="flex items-center gap-4 bg-black/20 border border-white/5 p-3.5 cursor-pointer hover:bg-black/30 transition-all">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={formData.preferences.includes('mentorship')}
                      onChange={() => handleCheckboxChange('mentorship')}
                    />
                    <span className="text-[10px] font-medium opacity-70">Mentorship opportunities</span>
                  </label>
                  <label className="flex items-center gap-4 bg-black/20 border border-white/5 p-3.5 cursor-pointer hover:bg-black/30 transition-all">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={formData.preferences.includes('partnership')}
                      onChange={() => handleCheckboxChange('partnership')}
                    />
                    <span className="text-[10px] font-medium opacity-70">Partnership & sponsorship</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 4: CONSENT */}
            <div className="bg-black/30 border border-white/5 p-5 space-y-4">
              <label className="flex items-start gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  className="custom-checkbox mt-1"
                  checked={formData.consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                />
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold tracking-wide">I agree to receive communications from The Ninani Group.</p>
                  <p className="text-[9px] leading-relaxed opacity-30 font-light">
                    By registering, you consent to being contacted by email (and optionally WhatsApp if you've provided your number) about this event and future Ninani Group activities. You can unsubscribe at any time. We will never share your data with third parties outside The Ninani Group.                  </p>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-10 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-[65%] bg-gold text-black font-bold tracking-[0.4em] uppercase py-5 rounded-none hover:bg-[#d4b980] transition-all disabled:opacity-50 disabled:cursor-wait"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
              <p className="text-[9px] opacity-30 leading-relaxed sm:w-[35%] text-center sm:text-left">
                Your details are handled securely and never sold.
              </p>
            </div>

          </form>

          <footer className="mt-12 border-t border-white/5 pt-8 text-center">
            <p className="text-[8px] opacity-20 leading-relaxed font-sans tracking-[0.3em] uppercase max-w-sm mx-auto">
              Information collected solely for event management by The Ninani Group © 2026
            </p>
          </footer>
        </div>
      </motion.div>


    </div>
  )
}

export default App
App
