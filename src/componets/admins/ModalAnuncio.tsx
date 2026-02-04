// src/components/admin/ModalAnuncio.tsx
'use client'

import { useState } from 'react'
import { getDb } from '@/lib/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import Image from 'next/image'

interface ModalAnuncioProps {
  tipo: 'lendarios' | 'shinys' | null
  itemEditar?: any
  onClose: () => void
  onSalvo: () => void
}

export default function ModalAnuncio({ tipo, itemEditar, onClose, onSalvo }: ModalAnuncioProps) {
  const [nome, setNome] = useState(itemEditar?.nome || '')
  const [preco, setPreco] = useState(itemEditar?.preco || '')
  const [descricao, setDescricao] = useState(itemEditar?.descricao || '')
  const [imagemUrl, setImagemUrl] = useState(itemEditar?.imagem || '')
  const [estaNoOvo, setEstaNoOvo] = useState(itemEditar?.estaNoOvo || false)
  const [processando, setProcessando] = useState(false)

  const handleSalvar = async () => {
    if (!nome || !preco || !descricao) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    if (!tipo) return

    setProcessando(true)
    try {
      const db = getDb()
      
      const dadosAnuncio: any = {
        nome,
        preco: Number(preco),
        descricao,
        imagem: estaNoOvo && tipo === 'shinys' ? '/img/ovo.png' : imagemUrl,
        criadoEm: itemEditar?.criadoEm || Timestamp.now()
      }

      if (tipo === 'shinys') {
        dadosAnuncio.estaNoOvo = estaNoOvo
      }

      if (itemEditar) {
        // Editar anúncio existente
        const docRef = doc(db, tipo, itemEditar.id)
        await updateDoc(docRef, dadosAnuncio)
        alert('Anúncio atualizado com sucesso!')
      } else {
        // Criar novo anúncio
        await addDoc(collection(db, tipo), dadosAnuncio)
        alert('Anúncio criado com sucesso!')
      }

      onSalvo()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error)
      alert('Erro ao salvar anúncio!')
    } finally {
      setProcessando(false)
    }
  }

  const handleDeletar = async () => {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return
    if (!tipo || !itemEditar) return

    setProcessando(true)
    try {
      const db = getDb()
      const docRef = doc(db, tipo, itemEditar.id)
      await deleteDoc(docRef)
      
      alert('Anúncio deletado com sucesso!')
      onSalvo()
      onClose()
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error)
      alert('Erro ao deletar anúncio!')
    } finally {
      setProcessando(false)
    }
  }

  if (!tipo) return null

  return (
    <div className="lendario-modal-overlay" onClick={onClose}>
      <div className="lendario-modal admin-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{itemEditar ? 'Editar Anúncio' : 'Criar Novo Anúncio'}</h2>
        
        <div className="admin-form">
          <div className="admin-form-group">
            <label>Nome do Item *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Squirtle Shiny"
              disabled={processando}
            />
          </div>

          <div className="admin-form-group">
            <label>Preço (R$) *</label>
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="Ex: 100"
              disabled={processando}
            />
          </div>

          <div className="admin-form-group">
            <label>Descrição *</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o item..."
              rows={3}
              disabled={processando}
            />
          </div>

          {tipo === 'shinys' && (
            <div className="admin-form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={estaNoOvo}
                  onChange={(e) => setEstaNoOvo(e.target.checked)}
                  disabled={processando}
                />
                <span>Está no ovo?</span>
              </label>
              {estaNoOvo && (
                <p className="ovo-info">* A imagem será substituída por um ovo automaticamente</p>
              )}
            </div>
          )}

          {(!estaNoOvo || tipo === 'lendarios') && (
            <div className="admin-form-group">
              <label>URL da Imagem {!estaNoOvo && '*'}</label>
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                disabled={processando}
              />
              {imagemUrl && (
                <div className="image-preview">
                  <img src={imagemUrl} alt="Preview" />
                </div>
              )}
            </div>
          )}

          <div className="admin-actions">
            <button
              onClick={handleSalvar}
              disabled={processando}
              className="lendario-btn lendario-btn-confirmar"
            >
              {processando ? 'Salvando...' : itemEditar ? 'Atualizar' : 'Criar Anúncio'}
            </button>

            {itemEditar && (
              <button
                onClick={handleDeletar}
                disabled={processando}
                className="lendario-btn lendario-btn-deletar"
              >
                {processando ? 'Deletando...' : 'Apagar Anúncio'}
              </button>
            )}

            <button
              onClick={onClose}
              disabled={processando}
              className="lendario-btn lendario-btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}