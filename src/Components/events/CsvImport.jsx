
import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import Papa from 'papaparse'

import { fetchEvents } from '../../features/events/eventsSlice'
import { importEventsFromCsv } from '../../services/eventService'

const requiredHeaders = [
    'title',
    'category',
    'location',
    'date',
    'price',
]

function CsvImport() {
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)

    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [status, setStatus] = useState('idle')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState([])
    const [successfulRows, setSuccessfulRows] = useState([])
    const [progress, setProgress] = useState(0)

    // Download CSV template
    function downloadCsvTemplate() {
        const csvContent = [
            'title,category,location,date,price,image,description',
            'React Developer Meetup,Technology,Rajkot,2026-11-15,499,,Meet React developers',
            'Music Night,Music,Ahmedabad,2026-11-20,799,,Live music event',
            'Business Summit,Business,Gandhinagar,2026-11-25,999,,Business networking',
        ].join('\n')

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = 'eventora-events-template.csv'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
    }

    // Select and preview CSV
    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0]

        setFile(null)
        setPreview([])
        setTotalRows(0)
        setMessage('')
        setErrors([])
        setSuccessfulRows([])
        setStatus('idle')
        setProgress(0)

        if (!selectedFile) return

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            setMessage('Please select a CSV file.')
            event.target.value = ''
            return
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setMessage('CSV file must be 10 MB or smaller.')
            event.target.value = ''
            return
        }

        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: (header) => header.trim().toLowerCase(),

            complete: (results) => {
                const headers = results.meta.fields || []

                const missingHeaders = requiredHeaders.filter(
                    (header) => !headers.includes(header)
                )

                if (missingHeaders.length > 0) {
                    setMessage(
                        `Missing required columns: ${missingHeaders.join(', ')}`
                    )
                    event.target.value = ''
                    return
                }

                if (results.errors.length > 0) {
                    setMessage('CSV contains formatting errors.')
                    setErrors(
                        results.errors.map(
                            (error) =>
                                `Row ${error.row + 1}: ${error.message}`
                        )
                    )
                    event.target.value = ''
                    return
                }

                if (results.data.length === 0) {
                    setMessage('Your CSV file contains no event records.')
                    event.target.value = ''
                    return
                }

                setFile(selectedFile)
                setPreview(results.data.slice(0, 5))
                setTotalRows(results.data.length)
            },

            error: () => {
                setMessage('Unable to read this CSV file.')
                event.target.value = ''
            },
        })
    }

    // Import CSV to backend
    async function handleImport() {
        if (!file || status === 'uploading') return

        setStatus('uploading')
        setMessage('')
        setErrors([])
        setSuccessfulRows([])
        setProgress(0)

        try {
            const result = await importEventsFromCsv(file, {
                onUploadProgress: ({ percent }) => setProgress(percent),
                onProgress: (payload) => {
                    if (payload.type === 'progress') {
                        setProgress(payload.percent || 0)
                    }
                },
            })

            const refreshResult = await dispatch(fetchEvents({ limit: 100 }))

            setFile(null)
            setPreview([])
            setTotalRows(0)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            const importErrors = result.errors || []
            setErrors(importErrors)
            setSuccessfulRows(result.successfulRows || [])
            setStatus(
                result.success
                    ? (importErrors.length > 0 ? 'partial' : 'success')
                    : 'error'
            )
            const refreshMessage = fetchEvents.fulfilled.match(refreshResult)
                ? ''
                : ' Event list could not be refreshed; reload the page to see the imported records.'
            setMessage(`${result.message || `Imported ${result.count} events.`}${refreshMessage}`)
        } catch (error) {
            setStatus('error')
            setSuccessfulRows([])

            const responseData = error.response?.data

            setMessage(
                responseData?.message || 'CSV import failed.'
            )

            setErrors(responseData?.errors || [])
        }
    }

    return (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-5 sm:p-6">

                <h2 className="text-xl font-bold text-white">
                    Import Events from CSV
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    Upload a CSV file to add multiple events to Eventora.
                    Maximum file size: 10 MB per file.
                </p>

                <button
                    type="button"
                    onClick={downloadCsvTemplate}
                    className="mt-4 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                    Download CSV Template
                </button>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileChange}
                        disabled={status === 'uploading'}
                        className="block w-full min-w-0 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                    />

                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!file || status === 'uploading'}
                        className="shrink-0 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === 'uploading'
                            ? 'Importing...'
                            : 'Import CSV'}
                    </button>
                </div>

                {status === 'uploading' && (
                    <div className="mt-4" aria-live="polite">
                        <div className="mb-1 flex justify-between text-xs text-slate-400">
                            <span>Import progress</span>
                            <span>{progress}%</span>
                        </div>
                        <progress
                            className="h-2 w-full accent-indigo-500"
                            max="100"
                            value={progress}
                            aria-label="CSV import progress"
                        />
                    </div>
                )}

                {file && (
                    <p className="mt-3 text-sm text-slate-400">
                        Selected: {file.name}
                    </p>
                )}

                {/* CSV Preview */}
                {file && preview.length > 0 && (
                    <div className="mt-6">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-white">
                                CSV Data Preview
                            </h3>

                            <span className="text-sm text-brand-500">
                                {totalRows} events found
                            </span>
                        </div>

                        <p className="mb-3 text-sm text-slate-400">
                            Showing first {preview.length} rows.
                        </p>

                        <div className="overflow-x-auto rounded-lg border border-surface-border">
                            <table className="w-full min-w-[650px] text-left text-sm">
                                <thead className="bg-slate-800 text-slate-300">
                                    <tr>
                                        {requiredHeaders.map((header) => (
                                            <th
                                                key={header}
                                                className="px-4 py-3 capitalize"
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {preview.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-surface-border text-slate-300"
                                        >
                                            {requiredHeaders.map((header) => (
                                                <td
                                                    key={header}
                                                    className="px-4 py-3"
                                                >
                                                    {row[header] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalRows > 5 && (
                            <p className="mt-2 text-xs text-slate-500">
                                And {totalRows - 5} more rows...
                            </p>
                        )}

                        <p className="mt-4 text-sm text-green-400">
                            Preview
                        </p>
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className={`mt-4 rounded-lg border p-3 text-sm ${
                            status === 'success'
                                ? 'border-green-700 bg-green-950/40 text-green-300'
                                : status === 'partial'
                                    ? 'border-amber-700 bg-amber-950/30 text-amber-300'
                                : 'border-red-700 bg-red-950/30 text-red-300'
                        }`}
                    >
                        {message}
                    </div>
                )}

                {errors.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-300">
                        {errors.map((error, index) => (
                            <li key={index}>
                                {typeof error === 'string'
                                    ? error
                                    : `Row ${error.row}: ${error.errors?.join(', ')}`}
                            </li>
                        ))}
                    </ul>
                )}

                {successfulRows.length > 0 && (
                    <p className="mt-3 text-sm text-green-300">
                        Imported CSV rows:{' '}
                        {successfulRows
                            .slice(0, 10)
                            .map(({ file, row }) => `${file}, row ${row}`)
                            .join('; ')}
                        {successfulRows.length > 10
                            ? `; and ${successfulRows.length - 10} more`
                            : ''}
                    </p>
                )}

            </div>
        </section>
    )
}

export default CsvImport
