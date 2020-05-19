const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')
const Place = require('../models/places')
const getCoordsForAddress = require('../util/location')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError('Something wrong. Could not find place', 500)
    return next(error)
  }
  if (!place) {
    const error = new HttpError('Could not find place', 404)
    return next(error)
  }
  res.json({ place: place.toObject({ getters: true }) })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid
  let places
  try {
    places = await Place.find({ creator: userId })
  } catch (err) {
    const error = new HttpError(
      'Something went wrong. Could not find any places',
      500
    )
    return next(error)
  }

  if (places.length === 0) {
    return next(
      new HttpError('Could not find place from provided user id', 404)
    )
  }
  res.json({ places: places.map((place) => place.toObject({ getters: true })) })
}

const createPlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422))
  }
  const { title, description, address, creator } = req.body

  let coordinates
  try {
    coordinates = await getCoordsForAddress(address)
  } catch (error) {
    return next(error)
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    creator,
    location: coordinates,
    image:
      'https://cropper.watch.aetnd.com/public-content-aetn.video.aetnd.com/video-thumbnails/AETN-History_VMS/21/202/tdih-may01-HD.jpg?w=1440',
  })

  try {
    await createdPlace.save()
  } catch (err) {
    const error = new HttpError('Could not create place', 500)
    return next(error)
  }

  res.status(201).json({ place: createdPlace })
}

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new HttpError('Invalid inputs', 422)
    return next(error)
  }
  const { title, description } = req.body
  const placeId = req.params.pid

  let updatedPlace

  try {
    updatedPlace = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError('Could not update place', 500)
    return next(error)
  }

  updatedPlace.title = title
  updatedPlace.description = description

  try {
    await updatedPlace.save()
  } catch (err) {
    const error = new HttpError('Could not update place', 500)
    return next(error)
  }

  res.status(200).json({ place: updatedPlace.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid
  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    const error = new HttpError('Could not find place', 500)
    return next(error)
  }
  if (!place) {
    const error = new HttpError('Could not find place', 404)
    return next(error)
  }

  try {
    await place.remove()
  } catch (err) {
    const error = new HttpError('Could not delete place', 500)
    return next(error)
  }

  res.status(200).json({ message: 'Deleted place' })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
