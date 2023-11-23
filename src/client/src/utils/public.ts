export default function publicPath(path: string) {
  return `${import.meta.env.FRONTEND_PUBLIC_PATH}${path}`
}