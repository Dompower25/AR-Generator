import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [contactData, setContactData] = useState({
    name: "Eugene Domanovich",
    phone: "+375",
    company: "ООО 'Джофент'",
    position: "System-Admin",
    email: "mail@gmail.com",
    website: "https://jofend.by/",
  });

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");

  // Функция для разделения имени и фамилии
  const splitName = (fullName) => {
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  // Функция для генерации vCard строки
  const generateVCard = useCallback((data) => {
    // Разделяем имя и фамилию
    const { firstName, lastName } = splitName(data.name);

    // Очищаем и форматируем номер телефона
    const cleanPhone = data.phone.replace(/[^\d+]/g, "");

    // Форматируем сайт (добавляем https:// если нужно)
    const websiteUrl = data.website.startsWith("http")
      ? data.website
      : "https://" + data.website;

    // Создаем vCard версии 3.0
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${data.name}`, // Полное имя
      `N:${lastName};${firstName};`, // Фамилия;Имя;Отчество;;;
      `ORG:${data.company}`, // Компания
      `TITLE:${data.position}`, // Должность
      `TEL;TYPE=PHONE:${cleanPhone}`, // Телефон
      `EMAIL;TYPE=EMAIL:${data.email}`, // Email
      `URL;TYPE=URL:${websiteUrl}`, // Сайт
      "END:VCARD",
    ].join("\n");

    return vCard;
  }, []);

  // Функция для генерации QR кода
  const generateQRCode = useCallback(
    async (data) => {
      try {
        setError("");
        const vCardString = generateVCard(data);

        // Опции для QR кода
        const options = {
          errorCorrectionLevel: "H",
          type: "image/png",
          quality: 1,
          margin: 2,
          width: 400,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        };

        const qrUrl = await QRCode.toDataURL(vCardString, options);
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.error("Ошибка генерации QR:", err);
        setError("Ошибка при генерации QR-кода. Проверьте введенные данные.");
      }
    },
    [generateVCard],
  );

  // Обновляем QR код при изменении любых данных
  useEffect(() => {
    generateQRCode(contactData);
  }, [contactData, generateQRCode]);

  // Обработчик изменения полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Скачивание QR кода
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `vcard_${contactData.name.replace(/\s/g, "_")}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  // Копирование QR кода в буфер
  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;

    try {
      const blob = await (await fetch(qrCodeUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      alert("QR-код скопирован в буфер обмена!");
    } catch (err) {
      console.error("Ошибка копирования:", err);
      alert("Не удалось скопировать QR-код");
    }
  };

  // Сброс к примеру
  const resetToExample = () => {
    setContactData({
      name: "Eugene Domanovich",
      phone: "+375",
      company: "ООО 'Джофент'",
      position: "System-Admin",
      email: "mail@gmail.com",
      website: "https://jofend.by/",
    });
  };

  // Получаем разделенное имя для отображения
  const { firstName, lastName } = splitName(contactData.name);

  return (
    <div className="container mt-4 mb-4">
      <div className="row">
        <div className="col-12 text-center mb-4">
          <h1 className="display-5">Генератор QR-кода для визитки</h1>
          <p className="lead">
            Создайте цифровую визитку для сохранения в контакты
          </p>
        </div>
      </div>

      <div className="row">
        {/* Форма ввода данных */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Данные контакта</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Имя и фамилия *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={contactData.name}
                  onChange={handleInputChange}
                  placeholder="Евгений Петров"
                />
                <small className="text-muted">
                  Имя: {firstName} | Фамилия: {lastName || "—"}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">Должность</label>
                <input
                  type="text"
                  className="form-control"
                  name="position"
                  value={contactData.position}
                  onChange={handleInputChange}
                  placeholder="Генеральный директор"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Компания</label>
                <input
                  type="text"
                  className="form-control"
                  name="company"
                  value={contactData.company}
                  onChange={handleInputChange}
                  placeholder="JoFend"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Телефон *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={contactData.phone}
                  onChange={handleInputChange}
                  placeholder="+375333333333"
                />
                <small className="text-muted">Формат: +375XXXXXXXXX</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={contactData.email}
                  onChange={handleInputChange}
                  placeholder="jofend@gmail.com"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Веб-сайт</label>
                <input
                  type="url"
                  className="form-control"
                  name="website"
                  value={contactData.website}
                  onChange={handleInputChange}
                  placeholder="Jofend.by"
                />
              </div>

              <button
                className="btn btn-secondary w-100 mt-2"
                onClick={resetToExample}
              >
                Сбросить к примеру
              </button>
            </div>
          </div>
        </div>

        {/* Блок с QR кодом */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">Ваш QR-код</h4>
            </div>
            <div className="card-body text-center">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {qrCodeUrl ? (
                <>
                  <div className="qr-container mb-3 p-3 bg-white d-inline-block rounded">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="img-fluid"
                      style={{ maxWidth: "280px", height: "auto" }}
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={downloadQRCode}
                    >
                      📥 Скачать QR-код (PNG)
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={copyToClipboard}
                    >
                      📋 Копировать QR-код
                    </button>
                  </div>

                  <div className="alert alert-info mt-3 small">
                    <strong>ℹ️ Инструкция:</strong>
                    <br />
                    • При сканировании QR-кода телефон предложит сохранить
                    контакт
                    <br />
                    • Имя, фамилия, должность, компания, телефон, email и сайт
                    будут заполнены автоматически
                    <br />• Поддерживается на iOS и Android
                  </div>
                </>
              ) : (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Генерация...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Предпросмотр данных vCard */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Предпросмотр vCard данных</h5>
            </div>
            <div className="card-body">
              <pre
                className="mb-0"
                style={{ fontSize: "12px", overflow: "auto" }}
              >
                {generateVCard(contactData)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
