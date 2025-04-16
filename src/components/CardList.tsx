"use client";

import React from 'react';

export interface Card {
    name: string;
    image_uris?: {
        small: string;
    };
}

const initialCards: Card[] = [
    { name: "Lightning Bolt" }, { name: "Forest" }, { name: "Black Lotus" }, { name: "Island" }, { name: "Mountain" }, { name: "Grizzly Bears" },
    { name: "Counterspell" }, { name: "Dark Ritual" }, { name: "Swamp" }, { name: "Memnite" }, { name: "Serra Angel" }, { name: "Time Walk" },
    { name: "Urzas Power Plant" }, { name: "Sol Ring" }, { name: "Plains" }, { name: "Demonic Tutor" }, { name: "Mox Emerald" },
    { name: "Mox Jet" }, { name: "Mox Pearl" }, { name: "Mox Ruby" }, { name: "Mox Sapphire" }, { name: "Llanowar Elves" },
    { name: "Giant Growth" }, { name: "Healing Salve" }, { name: "Disenchant" }, { name: "Terror" }, { name: "Animate Dead" },
    { name: "Stone Rain" }, { name: "Birds of Paradise" }, { name: "Swords to Plowshares" }, { name: "Wrath of God" },
    { name: "Black Knight" }, { name: "White Knight" }, { name: "Air Elemental" }, { name: "Fireball" }, { name: "Blue Elemental Blast" },
    { name: "Red Elemental Blast" }, { name: "Circle of Protection: Red" }, { name: "Circle of Protection: Blue" },
    { name: "Regenerate" }, { name: "Raise Dead" }, { name: "Vampiric Tutor" }, { name: "Mystic Tutor" }, { name: "Channel" }, { name: "Fork" }
];

const CardList: React.FC = () => {
    return (
        <div className="grid grid-cols-3 gap-4">
            {initialCards.map((card) => (
                <div key={card.name} className="bg-gray-700 p-2 rounded">
                    <p className="text-center">{card.name}</p>
                </div>
            ))}
        </div>
    );
};

export default CardList;
