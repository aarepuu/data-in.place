import React, { useCallback } from 'react'
import { Dropdown } from 'react-bootstrap'
import { GEO_REFS } from '../../constants'

export default function GeoSelector({
  title,
  type,
  value,
  list,
  onChange,
  ...props
}) {
  const handleChange = useCallback(
    (nextGeoType) => {
      if (onChange) {
        onChange(nextGeoType)
      }
    },
    [onChange]
  )

  return (
    <div className="option">
      {title}
      <Dropdown className="d-inline-block raw-dropdown">
        <Dropdown.Toggle
          variant="white"
          className="truncate-160px"
          disabled={GEO_REFS.length === 0}
        >
          {type}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {Object.keys(GEO_REFS).map((d) => {
            return (
              <Dropdown.Item key={d} onSelect={() => handleChange(d)}>
                {GEO_REFS[d]}
              </Dropdown.Item>
            )
          })}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
}
