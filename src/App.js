import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Simplified component replacements (unchanged)
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`button ${className}`}>{children}</button>
);

const Input = ({ type, value, onChange, placeholder, className, accept, ref }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`input ${className}`} accept={accept} ref={ref} />
);

const Card = ({ children, className }) => (
  <div className={`card ${className}`}>{children}</div>
);

const Switch = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="slider"></span>
  </label>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="label">{children}</label>
);

const Checkbox = ({ id, checked, onChange }) => (
  <input type="checkbox" id={id} checked={checked} onChange={onChange} className="checkbox" />
);

function App() {
  const [input, setInput] = useState('');
  const [qrCode, setQrCode] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [qrColor, setQrColor] = useState('#3B82F6');
  const [bgColor, setBgColor] = useState('#1E3A8A');
  const [customBgImage, setCustomBgImage] = useState(null);
  const [withoutImage, setWithoutImage] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('customBgImage changed:', customBgImage);
  }, [customBgImage]);

  const generateQRCode = () => {
    const data = input.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    const size = Math.ceil(Math.sqrt(data.length));
    const paddedData = data.padEnd(size * size, '0');
    const qr = [];
    for (let i = 0; i < size; i++) {
      qr.push(paddedData.slice(i * size, (i + 1) * size).split('').map(Number));
    }
    setQrCode(qr);
  };

  const downloadQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = qrCode.length;
    const scale = 10;
    canvas.width = size * scale;
    canvas.height = size * scale;

    if (customBgImage && !withoutImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawQRCode();
        downloadImage();
      };
      img.src = customBgImage;
    } else {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawQRCode();
      downloadImage();
    }

    function drawQRCode() {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (qrCode[y][x]) {
            ctx.fillStyle = qrColor;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
    }

    function downloadImage() {
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'CustomQRCode';
      downloadLink.href = pngFile;
      downloadLink.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomBgImage(e.target.result);
        setWithoutImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`app ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="container">
        <div className="header">
          <h1>Generate your QR Code</h1>
          <Switch
            checked={!isDarkTheme}
            onChange={() => setIsDarkTheme(!isDarkTheme)}
          />
        </div>
        <div className="content">
          <Card className="input-card">
            <div className="input-container">
              <Label htmlFor="url-input">Enter your URL</Label>
              <Input
                id="url-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add URL for QR Code generation"
              />
              <Label htmlFor="qr-color">Customize QR color</Label>
              <Input
                id="qr-color"
                type="color"
                value={qrColor}
                onChange={(e) => setQrColor(e.target.value)}
              />
              <Label htmlFor="bg-color">Customize background</Label>
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <Label htmlFor="file-upload">Upload custom image</Label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <Button
                onClick={handleFileButtonClick}
                className="file-upload-btn"
              >
                Choose File
              </Button>
              <div className="checkbox-container">
                <Checkbox
                  id="without-image"
                  checked={withoutImage}
                  onChange={(e) => setWithoutImage(e.target.checked)}
                />
                <Label htmlFor="without-image">Without image</Label>
              </div>
              <Button onClick={generateQRCode} className="generate-btn">
                Generate QR Code
              </Button>
            </div>
          </Card>
          <Card className="output-card">
            {qrCode.length > 0 && (
              <div className="qr-container">
                <div
                  className="qr-code"
                  style={{
                    gridTemplateColumns: `repeat(${qrCode.length}, 1fr)`,
                    backgroundColor: bgColor,
                    backgroundImage: !withoutImage && customBgImage ? `url(${customBgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {qrCode.flat().map((cell, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: cell ? qrColor : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <p className="qr-instructions">
                  Enter the URL of your site and create your custom QR Code in a few seconds with a few clicks.
                </p>
                <Button onClick={downloadQRCode} className="download-btn">
                  <span>DOWNLOAD NOW</span>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;