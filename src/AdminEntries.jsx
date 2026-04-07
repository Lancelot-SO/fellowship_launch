import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import logo from './assets/main_logo.png'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw, ChevronLeft, Search, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const AdminEntries = () => {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data)
    } catch (error) {
      toast.error('Failed to fetch entries: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const filteredEntries = entries.filter(entry => 
    entry.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.organisation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination Logic
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Organisation', 'Source', 'Date']
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(e => [
        `"${e.full_name}"`,
        `"${e.email}"`,
        `"${e.phone}"`,
        `"${e.organisation}"`,
        `"${e.source}"`,
        new Date(e.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'registrations.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-deep-green text-cream font-body p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-gold-muted hover:text-gold transition-colors text-[10px] uppercase tracking-[0.3em] font-bold">
              <ChevronLeft size={16} />
              Back to Site
            </Link>
            <div className="flex items-center gap-6">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
              <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight">
                Registrations <span className="italic text-gold">Dashboard</span>
              </h1>
            </div>
            <p className="text-body-sm opacity-40 max-w-md">Oversee and manage registration data for the D.A. Twum Jnr. Fellowship launch event.</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchEntries}
              disabled={loading}
              className="p-3 border border-border-green hover:border-gold transition-colors text-gold flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button 
              onClick={downloadCSV}
              className="p-3 bg-gold text-deep-green hover:bg-gold-light transition-colors flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or organisation..." 
            className="pl-12 !bg-panel-green/50 border-border-green focus:border-gold w-full h-12 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Entries Table */}
        <div className="bg-panel-green border border-border-green overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-deep-green/50 border-b border-border-green">
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Date</th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Full Name</th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Organisation</th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Email</th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Phone</th>
                  <th className="p-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-green/10">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-gold" size={32} />
                        <p className="text-xs uppercase tracking-widest opacity-40">Loading Entries...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedEntries.length > 0 ? (
                  paginatedEntries.map((entry) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={entry.id} 
                      className="hover:bg-deep-green/20 transition-colors group"
                    >
                      <td className="p-6">
                        <p className="text-[11px] font-medium opacity-40">{new Date(entry.created_at).toLocaleDateString()}</p>
                        <p className="text-[9px] opacity-20">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-bold group-hover:text-gold transition-colors">{entry.full_name}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-xs opacity-60 italic">{entry.organisation}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-mono opacity-80">{entry.email}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-xs opacity-60">{entry.phone || '—'}</p>
                      </td>
                      <td className="p-6">
                        <span className="inline-block px-3 py-1 bg-deep-green/50 border border-border-green/30 text-[9px] uppercase tracking-widest text-gold-muted">
                          {entry.source || 'Direct'}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <p className="text-xs uppercase tracking-widest opacity-40">No entries found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Stats */}
          <div className="p-6 border-t border-border-green bg-deep-green/30 flex justify-between items-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold-muted">
              Total Entries: <span className="text-gold">{filteredEntries.length}</span>
            </p>
            <div className="flex gap-4">
              <div className="badge-pill border-none !bg-gold/5 !text-[9px]">
                <div className="dot"></div>
                Live Database Connected
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-border-green/20 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-widest opacity-40">
                  Showing <span className="text-gold font-bold">{startIndex + 1}</span> to <span className="text-gold font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, filteredEntries.length)}</span> of <span className="text-gold font-bold">{filteredEntries.length}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border-green hover:border-gold disabled:opacity-20 disabled:hover:border-border-green transition-all text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    // Only show 5 pages nearby if many
                    if (totalPages > 5) {
                      if (page !== 1 && page !== totalPages && (page < currentPage - 1 || page > currentPage + 1)) {
                        if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="opacity-20 text-[10px]">...</span>
                        return null
                      }
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold border transition-all ${
                          currentPage === page 
                          ? 'bg-gold text-deep-green border-gold' 
                          : 'border-border-green text-gold-muted hover:border-gold-muted'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border-green hover:border-gold disabled:opacity-20 disabled:hover:border-border-green transition-all text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
                >
                  Next
                  <ChevronLeft size={14} className="rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEntries
