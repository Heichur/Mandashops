// src/components/admin/ModalTipoAnuncio.tsx
'use client'

interface ModalTipoAnuncioProps {
  onSelecionarTipo: (tipo: 'lendarios' | 'shinys') => void
  onClose: () => void
}

export default function ModalTipoAnuncio({ onSelecionarTipo, onClose }: ModalTipoAnuncioProps) {
  return (
    <div className="lendario-modal-overlay" onClick={onClose}>
      <div className="lendario-modal modal-tipo-anuncio" onClick={(e) => e.stopPropagation()}>
        <h2>Qual anúncio você deseja fazer?</h2>
        
        <div className="tipo-anuncio-buttons">
          <button
            onClick={() => onSelecionarTipo('shinys')}
            className="lendario-btn btn-tipo-shiny"
          >
            ✨ Shinys
          </button>
          
          <button
            onClick={() => onSelecionarTipo('lendarios')}
            className="lendario-btn btn-tipo-lendario"
          >
            🔥 Lendários
          </button>
        </div>

        <button
          onClick={onClose}
          className="lendario-btn lendario-btn-cancelar"
          style={{ marginTop: '20px' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}