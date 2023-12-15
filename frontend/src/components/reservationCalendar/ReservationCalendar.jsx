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
  const [alertMessage, setAlertMessage] = useState(null);

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

      const newReservation = {
        startDate: selectedRange[0].startDate,
        endDate: selectedRange[0].endDate,
        name: name,
        pricePerNight: pricePerNight,
      };
      fetchReservations();
      setName("");
      setPricePerNight("");

      setAlertMessage("¡Reserva confirmada!");

      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error confirming reservation:", error);
      setAlertMessage("Error al confirmar la reserva");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // +1 porque los meses empiezan desde 0
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });

  const eliminarReserva = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar la reserva");
      }

      const updatedReservations = reservations.filter(
        (reservation) => reservation._id !== id
      );
      setReservations(updatedReservations);
      setAlertMessage("¡Reserva eliminada!");

      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);

      fetchReservations();
    } catch (error) {
      console.error("Error al eliminar la reserva:", error);
      setAlertMessage("Error al eliminar la reserva");
    }
  };

  const getReservedDates = () => {
    return reservations.map((reservation) => ({
      startDate: new Date(reservation.startDate),
      endDate: new Date(reservation.endDate),
      key: `${reservation._id}`,
    }));
  };

  const isReserved = (date) => {
    return reservations.some(
      (reservation) =>
        date >= new Date(reservation.startDate) &&
        date <= new Date(reservation.endDate)
    );
  };

  const isDateRangeValid = (range) => {
    return (
      !range.startDate ||
      !range.endDate ||
      !isReserved(range.startDate) ||
      !isReserved(range.endDate)
    );
  };

  const handleDateRender = (date) => {
    const formattedDay = date.getDate();

    return (
      <div
        className={`day ${isReserved(date) ? "reserved-day" : ""}`}
        style={{
          backgroundColor: isReserved(date) ? "#ffd600" : "transparent",
          pointerEvents: isReserved(date) ? "none" : "auto",
          width: "100%",
          color: "gray",
        }}
      >
        {formattedDay}
      </div>
    );
  };

  const getBookedDates = () => {
    const booked = [];
    reservations.forEach((reservation) => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        booked.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    console.log("booked" + booked);
    return booked;
  };

  return (
    <div>
      <div>
        {alertMessage && (
          <div
            className={`alert ${
              alertMessage.includes("¡") ? "success" : "error"
            }`}
          >
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
          disabledDates={getBookedDates()}
          dayContentRenderer={handleDateRender}
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
