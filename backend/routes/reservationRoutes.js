const express = require("express");
const router = express.Router();
const Reservation = require("../models/reservationModel");

// Ruta para crear una nueva reserva
router.post("/", async (req, res) => {
  console.log("bbb");
  try {
    const { startDate, endDate, name, pricePerNight } = req.body;

    // Crea una nueva instancia de reserva con los datos recibidos
    const newReservation = new Reservation({
      startDate,
      endDate,
      name,
      pricePerNight,
      // Otros campos de la reserva si es necesario
    });

    // Guarda la reserva en la base de datos
    const savedReservation = await newReservation.save();

    res.status(201).json(savedReservation); // Devuelve la reserva creada como respuesta
  } catch (error) {
    res.status(500).json({ message: "Error creating reservation" });
  }
});

router.get("/", async (req, res) => {
  console.log("aaa");
  try {
    const reservations = await Reservation.find(); // Busca todas las reservas en la base de datos
    res.status(200).json(reservations); // Envía las reservas como respuesta
  } catch (error) {
    res.status(500).json({ message: "Error fetching reservations" });
  }
});

router.delete("/:reservationId", async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(
      req.params.reservationId
    );

    if (!deletedReservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.status(200).json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reserva" });
  }
});

module.exports = router;
