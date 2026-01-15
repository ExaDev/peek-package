import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { PackageInput } from './PackageInput'

describe('PackageInput', () => {
  it('renders input fields for two packages', () => {
    render(<PackageInput onCompare={() => {}} />)

    expect(screen.getByPlaceholderText('e.g., react')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., preact')).toBeInTheDocument()
  })

  it('shows compare button', () => {
    render(<PackageInput onCompare={() => {}} />)

    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument()
  })
})
