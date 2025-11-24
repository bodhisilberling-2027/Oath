export function generateShareLink(
  type: "audit-trail" | "execution-report" | "board-packet" | "evidence",
  id: string,
): string {
  // Generate a fake shareable link
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://oath.example.com"
  const shareId = Math.random().toString(36).substring(2, 15)
  return `${baseUrl}/shared/${type}/${shareId}`
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  }

  // Fallback for older browsers
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()

  try {
    document.execCommand("copy")
    document.body.removeChild(textarea)
    return Promise.resolve()
  } catch (err) {
    document.body.removeChild(textarea)
    return Promise.reject(err)
  }
}
