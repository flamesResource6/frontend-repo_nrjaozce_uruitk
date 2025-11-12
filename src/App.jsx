import { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'

function Section({ title, children, right }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-10">
      <div className={`${right ? 'lg:order-2' : ''}`}>
        <h2 className="text-2xl font-semibold text-white/90 mb-3">{title}</h2>
        <div className="text-white/70 leading-7 space-y-3">{children}</div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="h-48 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
      </div>
    </div>
  )
}

export default function App() {
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')
  const [userId] = useState('demo-user')
  const [file, setFile] = useState(null)
  const [material, setMaterial] = useState(null)
  const [summary, setSummary] = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [quiz, setQuiz] = useState([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('user_id', userId)
    form.append('file', file)
    const res = await fetch(`${backendUrl}/api/material/upload`, { method: 'POST', body: form })
    const data = await res.json()
    setMaterial(data)
    setLoading(false)
  }

  const getSummary = async () => {
    if (!material) return
    setLoading(true)
    const res = await fetch(`${backendUrl}/api/material/${material.material_id}/summary`)
    const data = await res.json()
    setSummary(data.summary)
    setLoading(false)
  }

  const genFlashcards = async () => {
    if (!material) return
    setLoading(true)
    const form = new FormData()
    form.append('user_id', userId)
    form.append('material_id', material.material_id)
    form.append('topic_index', '0')
    await fetch(`${backendUrl}/api/flashcards/generate`, { method: 'POST', body: form })
    const list = await fetch(`${backendUrl}/api/flashcards?material_id=${material.material_id}&user_id=${userId}`)
    const data = await list.json()
    setFlashcards(data)
    setLoading(false)
  }

  const genQuiz = async () => {
    if (!material) return
    setLoading(true)
    const form = new FormData()
    form.append('user_id', userId)
    form.append('material_id', material.material_id)
    form.append('topic_index', '0')
    await fetch(`${backendUrl}/api/quiz/generate`, { method: 'POST', body: form })
    const list = await fetch(`${backendUrl}/api/quiz?material_id=${material.material_id}&user_id=${userId}`)
    const data = await list.json()
    setQuiz(data)
    setLoading(false)
  }

  const submitQuiz = async () => {
    if (!quiz.length) return
    const payload = {
      user_id: userId,
      answers: quiz.map((q, i) => ({ correct_index: q.correct_index, selected: 0 }))
    }
    const res = await fetch(`${backendUrl}/api/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    alert(`Accuracy: ${(data.accuracy * 100).toFixed(0)}%`)
  }

  const ask = async () => {
    if (!question || !material) return
    setLoading(true)
    const res = await fetch(`${backendUrl}/api/chat/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, material_id: material.material_id, question }) })
    const data = await res.json()
    setAnswer(data.answer)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0B0F]">
      <div className="relative h-[60vh] w-full">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-[#0A0B0F]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">VectorTutor</h1>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">Multi-agent study copilot that reads your notes, makes flashcards and quizzes, plans revision, and answers doubts from your own material.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-white font-semibold mb-3">Upload Study Material</h3>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0])} className="text-white/80" />
            <button onClick={handleUpload} className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Processing...' : 'Upload & Process'}</button>
            {material && <p className="text-white/60 mt-2">Detected {material.topics?.length || 0} topics</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-white font-semibold mb-3">Summarize</h3>
            <button onClick={getSummary} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Summarize Material</button>
            {!!summary && <pre className="mt-3 text-white/80 whitespace-pre-wrap text-sm">{summary}</pre>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-white font-semibold mb-3">Flashcards</h3>
            <button onClick={genFlashcards} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">Generate</button>
            <div className="mt-4 space-y-3 max-h-64 overflow-auto pr-2">
              {flashcards.map((c, idx) => (
                <div key={idx} className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-white font-medium">Q: {c.question}</p>
                  <p className="text-white/80">A: {c.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-white font-semibold mb-3">Quiz</h3>
            <button onClick={genQuiz} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded">Generate</button>
            <div className="mt-4 space-y-3 max-h-64 overflow-auto pr-2">
              {quiz.map((q, idx) => (
                <div key={idx} className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-white font-medium">{q.question}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {q.options?.map((o, i) => (
                      <button key={i} className="text-left bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded">{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {!!quiz.length && <button onClick={submitQuiz} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded">Submit</button>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:col-span-2">
            <h3 className="text-white font-semibold mb-3">Ask a Doubt</h3>
            <div className="flex gap-3">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your uploaded notes..." className="flex-1 bg-white/10 border border-white/10 rounded px-3 py-2 text-white placeholder:text-white/40" />
              <button onClick={ask} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded">Ask</button>
            </div>
            {!!answer && <pre className="mt-3 text-white/80 whitespace-pre-wrap text-sm">{answer}</pre>}
          </div>
        </div>
      </div>

      <footer className="mt-16 py-10 border-t border-white/10 text-center text-white/40">
        VectorTutor • Adaptive learning with multi-agent collaboration
      </footer>
    </div>
  )
}
