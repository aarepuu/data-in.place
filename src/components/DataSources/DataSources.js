import React, { useEffect, useState } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import styles from './DataSources.module.scss'

// TODO: move into separate file
// for getting datasources from json file
function getSources() {
  return fetch('./dataSources.json').then((data) => data.json())
}

export default function DataSources({
  onSourceReady,
  setLoadingError,
  mapZoom,
  selectedAreas,
}) {
  const [sourcesList, setDataSources] = useState([])

  useEffect(() => {
    let mounted = true
    getSources().then((sources) => {
      if (mounted) {
        setDataSources(sources)
      }
    })
    return () => (mounted = false)
  }, [])

  const select = async (sample) => {
    const { delimiter, url, headers, join, params } = sample
    let response
    try {
      const fetchUrl = `${url}${selectedAreas.join(join)}${params}`
      response = await fetch(fetchUrl, {
        headers: headers,
      })
    } catch (e) {
      setLoadingError('Loading error. ' + e.message)
      return
    }
    const text = await response.text()
    onSourceReady(text, delimiter)
    setLoadingError(null)
  }
  return (
    <Row>
      {sourcesList
        // sort by category name
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((d, i) => {
          return (
            <Col xs={6} lg={4} xl={3} key={i} style={{ marginBottom: 15 }}>
              <Card
                className={
                  mapZoom <= parseInt(d.zoom[0]) &&
                  mapZoom > parseInt(d.zoom[1])
                    ? 'cursor-pointer h-100'
                    : 'cursor-pointer h-100 disabled'
                }
              >
                <Card.Body
                  onClick={() => {
                    select(d)
                  }}
                  className="d-flex flex-column"
                >
                  <Card.Title className="">
                    <h2 className="">{d.name}</h2>
                    <h4 className="m-0">{d.category}</h4>
                  </Card.Title>
                </Card.Body>
                <a
                  href={d.sourceURL}
                  className={[styles['dataset-source']].join(' ')}
                >
                  Source: {d.sourceName}
                </a>
              </Card>
            </Col>
          )
        })}
    </Row>
  )
}
