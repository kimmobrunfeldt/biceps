export function downloadAsJsonFile(fileName: string, data: any) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const link = document.createElement('a')
  link.download = fileName
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = [
    'application/json',
    link.download,
    link.href,
  ].join(':')
  link.click()
  link.remove()
}
