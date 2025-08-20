import React, { useState } from "react";
import Dropzone from "react-dropzone";
import "./App.css";

const players = [
  { key: "lionel_messi", name: "Lionel Messi", img: "./images/messi.jpeg" },
  { key: "maria_sharapova", name: "Maria Sharapova", img: "./images/sharapova.jpeg" },
  { key: "roger_federer", name: "Roger Federer", img: "./images/federer.jpeg" },
  { key: "serena_williams", name: "Serena Williams", img: "./images/serena.jpeg" },
  { key: "virat_kohli", name: "Virat Kohli", img: "./images/virat.jpeg" }
];

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setFile(reader.result);
      };
      reader.readAsDataURL(acceptedFiles[0]);
    }
  };

  const handleClassify = async () => {
    if (!file) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/classify_image", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ image_data: file })
      });
      const data = await response.json();
      console.log(data)


      if (!data || data.length === 0) {
        setError(true);
        setResult(null);
        return;
      }

      let bestMatch = null;
      let bestScore = -1;
      data.forEach((d) => {
        const maxScore = Math.max(...d.class_probability);
        if (maxScore > bestScore) {
          bestScore = maxScore;
          bestMatch = d;
        }
      });

      setResult(bestMatch);
      setError(false);
    } catch (err) {
      setError(true);
      setResult(null);
    }
  };

  return (
    <div className="container">
      <nav className="navbar navbar-light bg-light justify-content-center">
        <h3>Sports Person Classifier</h3>
      </nav>

      <div className="row">
        {players.map((p) => (
          <div key={p.key} className="col card-wrapper">
            <div className="card border-0">
              <div className="position-relative rounded-circle overflow-hidden mx-auto custom-circle-image">
                <img className="w-100 h-100" src={p.img} alt={p.name} />
              </div>
              <div className="card-body text-center mt-4">
                <h4 className="text-uppercase card-title">{p.name}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-sm-4">
          <Dropzone onDrop={handleDrop} multiple={false}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps({ className: "dropzone p-4 text-center" })}>
                <input {...getInputProps()} />
                {file ? (
                  <img src={file} alt="preview" height="120" />
                ) : (
                  <p>Drop file here or click to upload</p>
                )}
              </div>
            )}
          </Dropzone>
          <button
            className="btn btn-success mt-3 d-block mx-auto"
            onClick={handleClassify}
          >
            Classify
          </button>
        </div>

        {error && (
          <div className="col-sm-8 error">
            <p>Can't classify image. Classifier was not able to detect face and two eyes properly</p>
          </div>
        )}

        {result && (
          <div className="col-sm-8">
            <div className="row">
              <div className="col-sm-6">
                <div className="card border-0">
                  <div className="position-relative rounded-circle overflow-hidden mx-auto custom-circle-image">
                    <img
                      className="w-100 h-100"
                      src={players.find((p) => p.key === result.class)?.img}
                      alt={result.class}
                    />
                  </div>
                  <div className="card-body text-center mt-4">
                    <h4 className="text-uppercase card-title">
                      {players.find((p) => p.key === result.class)?.name}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <table id="classTable">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Probability Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.class_dictionary).map(([name, index]) => (
                      <tr key={name}>
                        <td>{name.replace("_", " ")}</td>
                        <td>{result.class_probability[index].toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
