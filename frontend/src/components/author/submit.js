import React, { useState } from "react";
import { Form, Button } from 'react-bootstrap';

const SubmitArticle = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [keyWords, setKeyWords] = useState("");
    const [file, setFile] = useState(null);

    const token = localStorage.getItem('access_token');
    const submitForm = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('key_words', keyWords);

        if (file) {
            formData.append('latex_project', file);
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        };

        fetch('http://localhost:5000/submit', requestOptions)
        .then((response) => {
            return response.json().then((data) => ({
                ok: response.ok,
                ...data,
            }));
        })
        .then(({ ok, message }) => {
            if (!ok) {
                throw new Error(message);
            }
            console.log(message);
            alert(message);
        })
        .catch((error) => {
            console.error(error.toString());
            alert(error.toString());
        });
    }

    return (
        <Form onSubmit={submitForm}>
            <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Key Words</Form.Label>
                <Form.Control type="text" value={keyWords} onChange={(e) => setKeyWords(e.target.value)} required />
            </Form.Group>

            <Form.Group>
                <Form.Label>Latex Project</Form.Label>
                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required />
            </Form.Group>

            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    );
};

export default SubmitArticle;