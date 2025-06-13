import React from 'react';
import { Link } from 'react-router-dom';
import '../css/ListingCard.css';

function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      <Link to={`/listing/${listing._id}`}>
        <img src={listing.imageUrl} alt={listing.title} />
        <div className="card-content">
          <h3>{listing.title}</h3>
          <p>{listing.location}</p>
          <strong>₹{listing.price} / night</strong>
        </div>
      </Link>
    </div>
  );
}

export default ListingCard;
