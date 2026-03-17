{/* Save Beneficiary Prompt */}
<AnimatePresence>
  {savePrompt && (
    <motion.div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        style={{ background: colors.card, borderRadius: '24px 24px 0 0', padding: '24px 24px 44px', width: '100%', maxWidth: '480px', boxSizing: 'border-box' }}
        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <div style={{ width: '40px', height: '4px', background: colors.border, borderRadius: '2px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 'bold', flexShrink: 0 }}>
            {recipient?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ color: colors.text, fontSize: '16px', fontWeight: 'bold', margin: '0 0 3px 0' }}>Save as Beneficiary?</p>
            <p style={{ color: colors.textSecondary, fontSize: '12px', margin: 0 }}>
              Quickly send to <strong>{recipient?.full_name}</strong> next time
            </p>
          </div>
        </div>
        <div style={{ background: colors.actionBg, borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Name</span>
            <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>{recipient?.full_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Phone</span>
            <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600' }}>{recipient?.phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Wallet</span>
            <span style={{ color: colors.text, fontSize: '12px', fontWeight: '600', fontFamily: 'monospace' }}>{recipient?.wallet_number}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button
            style={{ flex: 1, padding: '13px', background: 'transparent', color: colors.textSecondary, border: `1.5px solid ${colors.border}`, borderRadius: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
            whileTap={{ scale: 0.97 }} onClick={() => setSavePrompt(false)}
          >Not Now</motion.button>
          <motion.button
            style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #1A73E8, #0052CC)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,115,232,0.3)' }}
            whileTap={{ scale: 0.97 }} onClick={saveBeneficiary}
          >Save Beneficiary</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>