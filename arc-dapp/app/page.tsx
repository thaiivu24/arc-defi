'use client'

import { useState } from 'react'
import { useAccount, useBalance, useSendTransaction } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, isAddress } from 'viem'

const TOKENS = [
  { sym: 'ETH',  name: 'Ethereum',    icon: 'E', bg: '#2172E5', price: 3142.8 },
  { sym: 'USDC', name: 'USD Coin',    icon: 'U', bg: '#2775CA', price: 1.0 },
  { sym: 'USDT', name: 'Tether',      icon: 'T', bg: '#26A17B', price: 1.0 },
  { sym: 'WBTC', name: 'Wrapped BTC', icon: 'B', bg: '#F7931A', price: 67800 },
]

export default function Home() {
  const [tab, setTab] = useState<'swap'|'bridge'|'send'>('swap')
  const [fromAmt, setFromAmt] = useState('')
  const [toAmt, setToAmt]     = useState('')
  const [fromTok, setFromTok] = useState(TOKENS[0])
  const [toTok, setToTok]     = useState(TOKENS[1])
  const [bridgeAmt, setBridgeAmt] = useState('')
  const [sendAmt, setSendAmt]   = useState('')
  const [toAddr, setToAddr]     = useState('')
  const [toast, setToast]       = useState('')

  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { sendTransaction, isPending } = useSendTransaction()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const calcOut = (val: string) => {
    setFromAmt(val)
    const n = parseFloat(val)
    if (!n) { setToAmt(''); return }
    setToAmt(((n * fromTok.price) / toTok.price * 0.997).toFixed(4))
  }

  const doSwap = () => {
    if (!isConnected) return showToast('⚠️ Vui lòng kết nối ví')
    if (!fromAmt)     return showToast('⚠️ Nhập số lượng token')
    showToast('⏳ Đang xử lý swap...')
    setTimeout(() => showToast('✅ Swap thành công!'), 2000)
  }

  const doBridge = () => {
    if (!isConnected) return showToast('⚠️ Vui lòng kết nối ví')
    if (!bridgeAmt)   return showToast('⚠️ Nhập số lượng bridge')
    showToast('⏳ Đang bridge qua CCTP...')
    setTimeout(() => showToast('✅ Bridge thành công! ~2 phút'), 2500)
  }

  const doSend = () => {
    if (!isConnected)       return showToast('⚠️ Vui lòng kết nối ví')
    if (!sendAmt)           return showToast('⚠️ Nhập số lượng')
    if (!isAddress(toAddr)) return showToast('⚠️ Địa chỉ không hợp lệ')
    try {
      sendTransaction({ to: toAddr as `0x${string}`, value: parseEther(sendAmt) })
      showToast('⏳ Đang gửi...')
    } catch { showToast('❌ Lỗi giao dịch') }
  }

  const swapDir = () => {
    setFromTok(toTok); setToTok(fromTok)
    setFromAmt(''); setToAmt('')
  }

  return (
    <main style={{minHeight:'100vh',background:'#0a0b0f',color:'#F0F2FF',fontFamily:'system-ui,sans-serif'}}>
      {/* Header */}
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',borderBottom:'1px solid rgba(255,255,255,0.07)',background:'#111318'}}>
        <div style={{fontFamily:'monospace',fontSize:'18px',fontWeight:700}}>
          Arc<span style={{color:'#7B8FFF'}}>DeFi</span>
        </div>
        <div style={{display:'flex',background:'#181b23',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'3px',gap:'2px'}}>
          {(['swap','bridge','send'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'7px 20px',borderRadius:'7px',border:'none',cursor:'pointer',fontWeight:500,fontSize:'13px',background: tab===t ? '#5B6FF5' : 'transparent',color: tab===t ? '#fff' : '#7A7E99',textTransform:'capitalize'}}>
              {t}
            </button>
          ))}
        </div>
        <ConnectButton />
      </header>

      <div style={{display:'flex',justifyContent:'center',padding:'40px 16px'}}>
        <div style={{width:'100%',maxWidth:'440px',background:'#13151E',border:'1px solid rgba(255,255,255,0.13)',borderRadius:'20px',padding:'24px'}}>

          {/* SWAP TAB */}
          {tab === 'swap' && (
            <div>
              <div style={{fontSize:'11px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#7A7E99',fontWeight:600,marginBottom:'20px'}}>Token Swap</div>

              {/* From */}
              <div style={{background:'#0E1017',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'8px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'12px',color:'#7A7E99'}}>Bạn trả</span>
                  <span style={{fontSize:'11px',color:'#7A7E99'}}>Số dư: {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} {balance?.symbol}</span>
                </div>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <input value={fromAmt} onChange={e=>calcOut(e.target.value)} placeholder="0.00" type="number"
                    style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:'22px',fontWeight:700,color:'#F0F2FF',fontFamily:'monospace'}}/>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',background:'#181b23',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'7px 12px'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:fromTok.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700}}>{fromTok.icon}</div>
                    <span style={{fontSize:'13px',fontWeight:600}}>{fromTok.sym}</span>
                  </div>
                </div>
                <div style={{fontSize:'12px',color:'#7A7E99',marginTop:'8px',fontFamily:'monospace'}}>≈ ${fromAmt ? (parseFloat(fromAmt)*fromTok.price).toFixed(2) : '0.00'}</div>
              </div>

              {/* Arrow */}
              <div style={{display:'flex',justifyContent:'center',margin:'-4px 0',zIndex:1,position:'relative'}}>
                <button onClick={swapDir} style={{width:'36px',height:'36px',background:'#181b23',border:'2px solid rgba(255,255,255,0.13)',borderRadius:'10px',cursor:'pointer',fontSize:'16px',color:'#7A7E99'}}>⇅</button>
              </div>

              {/* To */}
              <div style={{background:'#0E1017',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'12px',color:'#7A7E99'}}>Bạn nhận</span>
                </div>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <input value={toAmt} readOnly placeholder="0.00" type="number"
                    style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:'22px',fontWeight:700,color:'#F0F2FF',fontFamily:'monospace'}}/>
                  <div style={{display:'flex',alignItems:'center',gap:'6px',background:'#181b23',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'10px',padding:'7px 12px'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:toTok.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700}}>{toTok.icon}</div>
                    <span style={{fontSize:'13px',fontWeight:600}}>{toTok.sym}</span>
                  </div>
                </div>
                <div style={{fontSize:'12px',color:'#7A7E99',marginTop:'8px',fontFamily:'monospace'}}>≈ ${toAmt ? (parseFloat(toAmt)*toTok.price).toFixed(2) : '0.00'}</div>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Tỷ giá</span>
                <span style={{fontFamily:'monospace'}}>1 {fromTok.sym} = {(fromTok.price/toTok.price).toFixed(4)} {toTok.sym}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Phí mạng</span><span style={{fontFamily:'monospace'}}>~$1.24</span>
              </div>

              <button onClick={doSwap} style={{width:'100%',padding:'15px',borderRadius:'14px',border:'none',background:'#5B6FF5',color:'#fff',fontSize:'15px',fontWeight:600,cursor:'pointer',marginTop:'12px'}}>
                {isPending ? 'Đang xử lý...' : 'Swap Token'}
              </button>
            </div>
          )}

          {/* BRIDGE TAB */}
          {tab === 'bridge' && (
            <div>
              <div style={{fontSize:'11px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#7A7E99',fontWeight:600,marginBottom:'20px'}}>Cross-chain Bridge</div>
              <div style={{background:'#0E1017',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'12px',color:'#7A7E99'}}>Số lượng USDC</span>
                </div>
                <input value={bridgeAmt} onChange={e=>setBridgeAmt(e.target.value)} placeholder="0.00" type="number"
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',fontSize:'22px',fontWeight:700,color:'#F0F2FF',fontFamily:'monospace'}}/>
                <div style={{fontSize:'12px',color:'#7A7E99',marginTop:'8px'}}>≈ ${bridgeAmt || '0.00'}</div>
              </div>

              {[{label:'Từ',name:'Ethereum Mainnet',dot:'#627EEA'},{label:'Đến',name:'Arc Mainnet',dot:'#FF0420'}].map(n=>(
                <div key={n.label}>
                  <div style={{fontSize:'11px',letterSpacing:'1px',textTransform:'uppercase',color:'#7A7E99',fontWeight:600,marginBottom:'6px'}}>{n.label}</div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#0E1017',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',padding:'12px 14px',marginBottom:'8px'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:n.dot}}/>
                    <span style={{fontSize:'13px',fontWeight:500}}>{n.name}</span>
                  </div>
                  {n.label==='Từ' && <div style={{textAlign:'center',color:'#7A7E99',fontSize:'18px',padding:'4px 0'}}>↓</div>}
                </div>
              ))}

              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Giao thức</span><span>CCTP v2</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Thời gian</span><span style={{color:'#00D68F'}}>~2 phút</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Bạn nhận</span><span style={{fontFamily:'monospace'}}>{bridgeAmt ? (parseFloat(bridgeAmt)-0.05).toFixed(2) : '—'} USDC</span>
              </div>

              <button onClick={doBridge} style={{width:'100%',padding:'15px',borderRadius:'14px',border:'none',background:'#5B6FF5',color:'#fff',fontSize:'15px',fontWeight:600,cursor:'pointer',marginTop:'12px'}}>
                Bridge via CCTP
              </button>
            </div>
          )}

          {/* SEND TAB */}
          {tab === 'send' && (
            <div>
              <div style={{fontSize:'11px',letterSpacing:'1.5px',textTransform:'uppercase',color:'#7A7E99',fontWeight:600,marginBottom:'20px'}}>Gửi Token</div>
              <div style={{background:'#0E1017',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'16px',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                  <span style={{fontSize:'12px',color:'#7A7E99'}}>Số lượng ETH</span>
                  <span style={{fontSize:'11px',color:'#7A7E99'}}>Số dư: {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'}</span>
                </div>
                <input value={sendAmt} onChange={e=>setSendAmt(e.target.value)} placeholder="0.00" type="number"
                  style={{width:'100%',background:'transparent',border:'none',outline:'none',fontSize:'22px',fontWeight:700,color:'#F0F2FF',fontFamily:'monospace'}}/>
                <div style={{fontSize:'12px',color:'#7A7E99',marginTop:'8px'}}>≈ ${sendAmt ? (parseFloat(sendAmt)*3142.8).toFixed(2) : '0.00'}</div>
              </div>

              <div style={{fontSize:'11px',letterSpacing:'1px',textTransform:'uppercase',color:'#7A7E99',fontWeight:600,marginBottom:'6px'}}>Địa chỉ nhận</div>
              <input value={toAddr} onChange={e=>setToAddr(e.target.value)} placeholder="0x... hoặc ENS name"
                style={{width:'100%',background:'#0E1017',border:`1px solid ${toAddr && !isAddress(toAddr) ? '#FF4D6D' : 'rgba(255,255,255,0.07)'}`,borderRadius:'12px',padding:'12px 14px',fontFamily:'monospace',fontSize:'12px',color:'#F0F2FF',outline:'none',marginBottom:'8px'}}/>
              {toAddr && !isAddress(toAddr) && <div style={{fontSize:'11px',color:'#FF4D6D',marginBottom:'8px'}}>⚠️ Địa chỉ không hợp lệ</div>}

              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Phí mạng</span><span>~$0.82</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#7A7E99',padding:'6px 4px'}}>
                <span>Tổng</span><span style={{fontFamily:'monospace'}}>{sendAmt ? `${sendAmt} ETH + ~$0.82` : '—'}</span>
              </div>

              <button onClick={doSend} style={{width:'100%',padding:'15px',borderRadius:'14px',border:'none',background: isConnected && sendAmt && isAddress(toAddr) ? '#5B6FF5' : '#3E4260',color: isConnected && sendAmt && isAddress(toAddr) ? '#fff' : '#7A7E99',fontSize:'15px',fontWeight:600,cursor:'pointer',marginTop:'12px'}}>
                {isPending ? 'Đang gửi...' : 'Gửi Token'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',bottom:'24px',left:'50%',transform:'translateX(-50%)',background:'#1A1D28',border:'1px solid rgba(255,255,255,0.13)',borderRadius:'12px',padding:'12px 20px',fontSize:'13px',fontWeight:500,whiteSpace:'nowrap',zIndex:100}}>
          {toast}
        </div>
      )}
    </main>
  )
}
