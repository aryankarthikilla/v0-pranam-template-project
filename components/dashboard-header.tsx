import type React from "react"
import LanguageSwitcher from "./language-switcher"

interface DashboardHeaderProps {
  title: string
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
  return (
    <header className="bg-gray-100 py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <LanguageSwitcher />
    </header>
  )
}

export default DashboardHeader
