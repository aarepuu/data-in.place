import React from 'react'
import styles from './Footer.module.scss'
import { Row, Col, Container } from 'react-bootstrap'
import { BsFillEnvelopeFill } from 'react-icons/bs'
import { FaGithub } from 'react-icons/fa'

// #TODO add commit hash
// const commitHash = process.env.REACT_APP_VERSION || 'dev'

export default function Footer(props) {
  return (
    <Container fluid style={{ backgroundColor: 'var(--dark)' }}>
      <Container className={styles.footer}>
        <Row>
          <Col xs={6} sm={{ span: 5, order: 1 }} lg={{ span: 3, order: 1 }}>
            <p className="Xsmall">
              Data:In Place is an open source tool developed by{' '}
              <a
                href="http://github.com/aarepuu"
                target="_blank"
                rel="noopener noreferrer"
              >
                aarepuu
              </a>
              , which leverages{' '}
              <a
                href="http://rawgraphs.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                RAWGraphs{' '}
              </a>
              (© 2013-2021{' '}
              <a
                href="https://raw.github.com/rawgraphs/rawgraphs-app/master/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
              >
                Apache License 2.0
              </a>
              ).
              <br />© 2018-2021 (
              <a href="https://github.com/aarepuu/data-in.place/blob/master/LICENSE">
                MIT License
              </a>
              )
            </p>
          </Col>
          <Col xs={6} sm={{ span: 5, order: 3 }} lg={{ span: 3, order: 1 }}>
            <p className="Xsmall"></p>
          </Col>
          {/* <Col xs={6} sm={{span:5, order:3}} lg={{span:3,order:1}}><p className="Xsmall">This <span title={commitHash}>version</span> is intended to be available only for the backers of the crowdfunding campaign.</p></Col> */}
          <Col
            xs={6}
            sm={{ span: 6, offset: 1, order: 2 }}
            md={{ span: 3 }}
            lg={{ offset: 0 }}
            xl={{ span: 2, offset: 2 }}
          >
            <p>
              <BsFillEnvelopeFill /> hello at data-in.place
            </p>
          </Col>
          <Col
            xs={6}
            sm={{ span: 6, offset: 1, order: 4 }}
            md={{ span: 2 }}
            lg={{ offset: 0 }}
            xl={{ span: 2, offset: 0 }}
          >
            <p>
              <FaGithub />{' '}
              <a
                href="https://github.com/aarepuu/data-in.place"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}
