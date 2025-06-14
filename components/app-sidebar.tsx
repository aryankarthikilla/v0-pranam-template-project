"use client"

import type React from "react"
import { useState } from "react"
import styled from "styled-components"

// Define styled components
const SidebarContainer = styled.div`
  width: ${(props) => (props.collapsed ? "80px" : "250px")};
  height: 100vh;
  background-color: #f0f0f0;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const SidebarHeader = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #ccc;
`

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const MenuItem = styled.li`
  padding: 15px;
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #ddd;
  }
`

const MenuIcon = styled.span`
  margin-right: 10px;
`

const CollapseButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 10px;
  cursor: pointer;
  align-self: flex-end;
  margin-left: auto;
`

const LogoContainer = styled.div`
  font-size: 20px;
  font-weight: bold;
`

interface LogoProps {
  showText: boolean
}

const Logo: React.FC<LogoProps> = ({ showText }) => {
  return <LogoContainer>{showText ? "My App" : "MA"}</LogoContainer>
}

interface SidebarProps {
  menuItems: { icon: React.ReactNode; label: string }[]
}

const AppSidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const [state, setState] = useState({ collapsed: false })

  const toggleSidebar = () => {
    setState({ ...state, collapsed: !state.collapsed })
  }

  const isCollapsed = state.collapsed

  return (
    <SidebarContainer collapsed={state.collapsed}>
      <SidebarHeader className="border-b border-border/50">
        <div className={`px-3 py-3 ${isCollapsed ? "flex justify-center" : ""}`}>
          <Logo showText={!isCollapsed} />
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {menuItems.map((item, index) => (
          <MenuItem key={index}>
            <MenuIcon>{item.icon}</MenuIcon>
            {!state.collapsed && item.label}
          </MenuItem>
        ))}
      </SidebarMenu>
      <CollapseButton onClick={toggleSidebar}>{state.collapsed ? "Expand" : "Collapse"}</CollapseButton>
    </SidebarContainer>
  )
}

export { AppSidebar }
