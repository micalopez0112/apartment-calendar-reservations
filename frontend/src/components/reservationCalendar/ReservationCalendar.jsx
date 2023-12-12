import React, { useState, useEffect } from "react";
import { DateRangePicker } from "react-date-range";
import { DateRange } from "react-date-range";
import "./ReservationCalendar.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const ReservationCalendar = () => {
  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [name, setName] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [reservations, setReservations] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null); // Nuevo estado para el mensaje de alerta

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const handleSelect = (ranges) => {
    setSelectedRange([ranges.selection]);
  };

  const handleConfirmReservation = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: selectedRange[0].startDate,
          endDate: selectedRange[0].endDate,
          name: name,
          pricePerNight: pricePerNight,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to confirm reservation.");
      }

      // Agregar la nueva reserva a la lista localmente
      const newReservation = {
        startDate: selectedRange[0].startDate,
        endDate: selectedRange[0].endDate,
        name: name,
        pricePerNight: pricePerNight,
      };
      setReservations([...reservations, newReservation]);

      console.log("Reservation confirmed successfully!");
      setAlertMessage("¡Reserva confirmada!"); // Establecer mensaje de alerta al confirmar

      setTimeout(() => {
        setAlertMessage(null); // Eliminar el mensaje de alerta después de cierto tiempo (por ejemplo, 3 segundos)
      }, 3000); // Tiempo en milisegundos (en este caso, 3 segundos)

      console.log("Reservation confirmed successfully!");
    } catch (error) {
      console.error("Error confirming reservation:", error);
      setAlertMessage("Error al confirmar la reserva");
    }
  };

  const formatDate = (dateString) => {
    console.log(dateString);
    const date = new Date(dateString);

    // Obtenemos el día, mes y año
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 porque los meses empiezan desde 0
    const year = date.getFullYear();

    // Creamos la cadena de fecha en formato dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });

  const eliminarReserva = async (id) => {
    try {
      console.log(id);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar la reserva");
      }
      console.log("Reservation deleted successfully!");
      setAlertMessage("¡Reserva eliminada!"); // Establecer mensaje de alerta al eliminar

      setTimeout(() => {
        setAlertMessage(null); // Eliminar el mensaje de alerta después de cierto tiempo (por ejemplo, 3 segundos)
      }, 3000);

      // Eliminación exitosa, manejar cualquier lógica adicional si es necesaria
      // Por ejemplo, volver a cargar las reservas actualizadas después de la eliminación
      fetchReservations(); // Vuelve a cargar las reservas después de eliminar una
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      setAlertMessage("Error al eliminar la reserva"); // Establecer mensaje de alerta en caso de error
    }
  };

  return (
    <div>
      <div>
        {/* Resto de tu JSX */}
        {alertMessage && (
          <div
            className={`alert ${
              alertMessage.includes("¡") ? "success" : "error"
            }`}
          >
            {/* Mostrar el mensaje de alerta si existe */}
            {alertMessage}
          </div>
        )}
      </div>
      <div className="reservation-calendar-container">
        <div className="title">Reservas</div>

        <DateRange
          className="date-range"
          minDate={new Date()}
          editableDateInputs={true}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          ranges={selectedRange}
        />

        <div className="inputs-container">
          <input
            className="name-input"
            placeholder="Nombre"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="price-input"
            placeholder="Precio/noche"
            type="text"
            inputMode="numeric"
            value={pricePerNight}
            onChange={(e) => setPricePerNight(e.target.value)}
          />
          <button className="confirm-button" onClick={handleConfirmReservation}>
            Confirmar reserva
          </button>
        </div>
      </div>
      <div className="confirmed-reservations-container">
        <div className="title">Reservas confirmadas</div>
        <div>
          <ul className="reservation-info">
            {sortedReservations.map((reservation) => (
              <div className="info" key={reservation._id}>
                <li className="list-item">
                  {formatDate(reservation.startDate)} {" - "}
                  {formatDate(reservation.endDate)}
                  {" - $"}
                  {reservation.pricePerNight}
                  {"/noche"}
                  {" - "}
                  {reservation.name}
                  <button
                    className="delete-button"
                    onClick={() => eliminarReserva(reservation._id)}
                  >
                    Eliminar
                  </button>
                </li>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;
