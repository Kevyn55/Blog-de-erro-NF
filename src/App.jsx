import { useState, useEffect } from 'react'
import './App.css'

const ERROS_PADRAO = [
  {
    codigo: '204',
    descricao: 'Rejeição: Duplicidade de NF-e',
    solucao: 'Verifique se a nota já foi transmitida anteriormente. Caso sim, utilize a chave de acesso já autorizada.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  },
  {
    codigo: '539',
    descricao: 'Rejeição: Duplicidade de NF-e, com diferença na Chave de Acesso',
    solucao: 'Verifique se os dados da nota estão corretos. Se necessário, altere o número, série ou outros campos que compõem a chave.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  },
  {
    codigo: '327',
    descricao: 'Rejeição: CFOP de operação interna e idDest diferente de 1',
    solucao: 'Ajuste o campo idDest para 1 (Operação interna) ou utilize um CFOP de operação interestadual/externa.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  },
  {
    codigo: '215',
    descricao: 'Rejeição: Falha no Schema XML',
    solucao: 'Verifique se o XML está de acordo com o layout exigido pela SEFAZ. Corrija eventuais erros de estrutura.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  },
  {
    codigo: '539',
    descricao: 'Rejeição: Duplicidade de NF-e, com diferença na Chave de Acesso',
    solucao: 'Verifique se os dados da nota estão corretos. Se necessário, altere o número, série ou outros campos que compõem a chave.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  },
  {
    codigo: '232',
    descricao: 'Rejeição: IE do destinatário não informada',
    solucao: 'Informe a Inscrição Estadual do destinatário, caso ele seja contribuinte do ICMS.',
    imagemErro: '',
    imagemSolucao: '',
    data: '07/06/2025'
  }
]

function App() {
  const [erros, setErros] = useState([])
  const [form, setForm] = useState({
    codigo: '',
    descricao: '',
    solucao: '',
    imagemErro: '',
    imagemSolucao: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [alerta, setAlerta] = useState(null)
  const [filtroCampo, setFiltroCampo] = useState('codigo')
  const [busca, setBusca] = useState('')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [detalheAberto, setDetalheAberto] = useState(null)
  const [popupImg, setPopupImg] = useState(null)
  const ITENS_POR_PAGINA = 6

  useEffect(() => {
    try {
      const dados = localStorage.getItem('errosNotasFiscais')
      if (dados && JSON.parse(dados).length > 0) {
        setErros(JSON.parse(dados))
      } else {
        setErros(ERROS_PADRAO)
        localStorage.setItem('errosNotasFiscais', JSON.stringify(ERROS_PADRAO))
      }
    } catch {
      setErros(ERROS_PADRAO)
      localStorage.setItem('errosNotasFiscais', JSON.stringify(ERROS_PADRAO))
      setAlerta('Erro ao carregar a lista de erros. Dados padrão carregados.')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('errosNotasFiscais', JSON.stringify(erros))
  }, [erros])

  function handleChange(e) {
    const { name, value, files } = e.target
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = ev => {
        setForm(f => ({ ...f, [name]: ev.target.result }))
      }
      reader.readAsDataURL(files[0])
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.codigo || !form.descricao || !form.solucao) return
    setErros(arr => [{ ...form, data: new Date().toLocaleDateString('pt-BR') }, ...arr])
    setForm({ codigo: '', descricao: '', solucao: '', imagemErro: '', imagemSolucao: '' })
    setShowForm(false)
  }

  // Filtro dinâmico
  const errosFiltrados = erros.filter(erro => {
    const buscaLower = busca.toLowerCase()
    if (!busca) return true
    if (filtroCampo === 'codigo') return erro.codigo.toLowerCase().includes(buscaLower)
    if (filtroCampo === 'descricao') return erro.descricao.toLowerCase().includes(buscaLower)
    if (filtroCampo === 'solucao') return erro.solucao.toLowerCase().includes(buscaLower)
    return true
  })

  // Paginação
  const totalPaginas = Math.ceil(errosFiltrados.length / ITENS_POR_PAGINA)
  const errosPaginados = errosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  )

  useEffect(() => {
    // Se a busca/filtro reduzir o total de páginas, volta para a primeira página
    if (paginaAtual > totalPaginas) setPaginaAtual(1)
  }, [busca, filtroCampo, totalPaginas])

  // Obter lista de códigos únicos para filtro
  const codigosUnicos = Array.from(new Set(erros.map(e => e.codigo.split(/\d/)[0]))).filter(Boolean)

  // Limpa o campo de busca ao trocar o filtro
  function handleFiltroCampoChange(e) {
    setFiltroCampo(e.target.value)
    setBusca('')
  }

  return (
    <>
      <header>
        <span className="header-title"><span className="icon">📑</span> Blog de Erros NFe</span>
        <nav>
          <a href="#" className={!showForm ? 'active' : ''} onClick={() => setShowForm(false)}>Home</a>
          <a href="#" className={showForm ? 'active' : ''} onClick={() => setShowForm(true)}>Cadastrar Erro</a>
        </nav>
      </header>
      <div className="menu-erro-topo">
        <div className="menu-listas" style={{flex:1, display:'flex', alignItems:'center', gap:'1em'}}>
          <label>Filtrar por:</label>
          <select value={filtroCampo} onChange={handleFiltroCampoChange}>
            <option value="codigo">Código</option>
            <option value="descricao">Descrição</option>
            <option value="solucao">Solução</option>
          </select>
          <div className="menu-pesquisa" style={{marginLeft:'1em'}}>
            <input
              type="text"
              placeholder={
                filtroCampo === 'codigo' ? 'Pesquisar código...' :
                filtroCampo === 'descricao' ? 'Pesquisar descrição...' :
                'Pesquisar solução...'}
              value={busca}
              onChange={e => setBusca(e.target.value)}
              key={filtroCampo} // força reset ao trocar filtro
            />
            <button className="btn-pesquisar" onClick={() => setBusca(busca)}>
              🔍
            </button>
          </div>
        </div>
      </div>
      <div className="container">
        {!showForm && (
          <>
            <div className="titulo-lista">Lista de Erros NFe</div>
            {alerta && (
              <div className="alerta">
                <strong>Aviso:</strong><br />
                {alerta}
              </div>
            )}
            <div className="cards">
              {errosFiltrados.length === 0 && <p>Nenhum erro cadastrado.</p>}
              {errosPaginados.map((erro, idx) => {
                const globalIdx = idx + (paginaAtual-1)*ITENS_POR_PAGINA;
                const aberto = detalheAberto === globalIdx;
                return (
                  <div className="card-erro" key={globalIdx}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span className="codigo">{erro.codigo}</span>
                      <span className="data">{erro.data || ''}</span>
                    </div>
                    <h3>{erro.descricao}</h3>
                    <p>{erro.solucao}</p>
                    {aberto && erro.imagemErro && (
                      <button
                        className="btn-img-popup"
                        type="button"
                        onClick={() => setPopupImg({src: erro.imagemErro, alt: 'Imagem do erro'})}
                        style={{marginBottom: '0.3em'}}
                      >Ver imagem do erro</button>
                    )}
                    {aberto && erro.imagemSolucao && (
                      <button
                        className="btn-img-popup"
                        type="button"
                        onClick={() => setPopupImg({src: erro.imagemSolucao, alt: 'Imagem da solução'})}
                        style={{marginBottom: '0.3em'}}
                      >Ver imagem da solução</button>
                    )}
                    <div className="botoes-card">
                      <button className="btn-detalhes" onClick={() => setDetalheAberto(aberto ? null : globalIdx)}>
                        {aberto ? 'Ocultar Detalhes ↑' : 'Ver Detalhes →'}
                      </button>
                      <button className="btn-excluir" onClick={() => {
                        if(window.confirm('Tem certeza que deseja excluir este erro?')) {
                          setErros(erros.filter((_, i) => i !== globalIdx))
                          if (detalheAberto === globalIdx) setDetalheAberto(null)
                        }
                      }}>Excluir</button>
                    </div>
                  </div>
                )
              })}
            </div>
            {popupImg && (
              <div className="popup-img-bg" onClick={() => setPopupImg(null)}>
                <div className="popup-img-content" onClick={e => e.stopPropagation()}>
                  <img src={popupImg.src} alt={popupImg.alt} />
                  <button className="btn-fechar-popup" onClick={() => setPopupImg(null)}>Fechar</button>
                </div>
              </div>
            )}
            {totalPaginas > 1 && (
              <div className="paginacao">
                <button onClick={() => setPaginaAtual(p => Math.max(1, p-1))} disabled={paginaAtual === 1}>Anterior</button>
                {Array.from({length: totalPaginas}, (_,i) => (
                  <button
                    key={i+1}
                    className={paginaAtual === i+1 ? 'pagina-atual' : ''}
                    onClick={() => setPaginaAtual(i+1)}
                    disabled={paginaAtual === i+1}
                  >{i+1}</button>
                ))}
                <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p+1))} disabled={paginaAtual === totalPaginas}>Próxima</button>
              </div>
            )}
          </>
        )}
        {showForm && (
          <form className="formulario" onSubmit={handleSubmit}>
            <input name="codigo" placeholder="Código do erro" value={form.codigo} onChange={handleChange} required />
            <textarea name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} required />
            <textarea name="solucao" placeholder="Solução" value={form.solucao} onChange={handleChange} required />
            <label>Imagem do erro:
              <input type="file" name="imagemErro" accept="image/*" onChange={handleChange} />
            </label>
            <label>Imagem da solução:
              <input type="file" name="imagemSolucao" accept="image/*" onChange={handleChange} />
            </label>
            <div style={{display:'flex',gap:'1em',justifyContent:'center'}}>
              <button type="submit">Salvar</button>
              <button type="button" style={{background:'#888'}} onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default App
