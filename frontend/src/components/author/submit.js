import React, { useState } from "react";
import { Card, Form, Button } from 'react-bootstrap';

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
        <Card className="mt-5 p-5">
            <Form onSubmit={submitForm} className="form-class">
                <h2>Rellene el formulario</h2>
                <Form.Group>
                    <Form.Label className="label-class">Title</Form.Label>
                    <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="input-class" />
                </Form.Group>

                <Form.Group>
                    <Form.Label className="label-class">Description</Form.Label>
                    <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="input-class" />
                </Form.Group>

                <Form.Group>
                    <Form.Label className="label-class">Key Words</Form.Label>
                    <Form.Control type="text" value={keyWords} onChange={(e) => setKeyWords(e.target.value)} required className="input-class" />
                </Form.Group>

                <Form.Group>
                    <Form.Label className="label-class">Latex Project</Form.Label>
                    <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} required className="input-class" />
                </Form.Group>

                <Button variant="primary" type="submit" className="button-class">
                    Submit
                </Button>
            </Form>
        </Card>
    );
};

export default SubmitArticle;