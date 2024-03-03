import React, { useState, useEffect } from 'react';
import { Table, Container, Modal } from 'react-bootstrap';
import PDFViewer from '..view_pdf';

function ShowArticles({ reviewer_usrname }) {
  const [articles, setArticles] = useState([])
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await fetch(`/evaluate/${reviewer_usrname}`)
      setArticles(response.data)
    }
    fetchArticles()
  }, [reviewer_usrname])

  const handleShowPdf = async (pdfUrl) => {
    const response = await fetch(pdfUrl)
    const blob = await response.blob()
    setSelectedPdf(blob)
    setShowModal(true)
  }

  return (
    <Container className="my-5">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>PDF Link</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{article.title}</td>
              <td><button onClick={() => handleShowPdf(article.pdf)}>View PDF</button></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <PDFViewer file={selectedPdf} />
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default ShowArticles;