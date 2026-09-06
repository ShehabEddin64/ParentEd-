import { useState, type FormEvent } from "react";
import { MapPin, Eye, EyeOff, Save } from "lucide-react";
import type { Props } from "../App";
import { interestOptions, optional, quebecCities, required } from "../domain";
import { PageTitle } from "./ui";
import { MapView } from "./MapView";
export function Profile({ data, profile, api, run, busy }: Props) {
  const [city, setCity] = useState(profile.city);
  const [show, setShow] = useState(profile.show_on_map);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const place = quebecCities.find((c) => c.name === city);
  const neighbours = data.members.filter(
    (m) => m.city === city && m.id !== profile.id && m.show_on_map,
  ).length;
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(
      () =>
        api.patch("profiles", profile.id, {
          display_name: required(String(f.get("display_name")), 80),
          city,
          lat: place?.lat ?? null,
          lng: place?.lng ?? null,
          bio: optional(String(f.get("bio")), 600),
          children_ages: optional(String(f.get("children_ages")), 80),
          interests,
          show_on_map: show && Boolean(place),
        }),
      "Profil enregistré.",
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="Mon profil"
        title="Ce que les autres parents voient de vous."
        description="Un prénom, une ville, quelques intérêts : de quoi trouver des familles qui vous ressemblent. Aucune adresse, aucun nom d’enfant."
      />
      <div className="profile-layout">
        <form className="editor form-grid" onSubmit={submit}>
          <label>
            Prénom affiché
            <input
              name="display_name"
              defaultValue={profile.display_name}
              required
              maxLength={80}
            />
          </label>
          <label>
            Ville ou secteur
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Non précisé</option>
              {quebecCities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Âges des enfants (facultatif, sans prénom)
            <input
              name="children_ages"
              defaultValue={profile.children_ages}
              maxLength={80}
              placeholder="6 et 8 ans"
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              disabled={!place}
            />
            {show ? <Eye size={16} /> : <EyeOff size={16} />}
            Apparaître sur la carte des familles (au centre de la ville, jamais
            à votre adresse)
          </label>
          <fieldset className="span-2 interests">
            <legend>Intérêts</legend>
            {interestOptions.map((i) => (
              <label
                key={i}
                className={`chip ${interests.includes(i) ? "on" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={interests.includes(i)}
                  onChange={(e) =>
                    setInterests(
                      e.target.checked
                        ? [...interests, i]
                        : interests.filter((x) => x !== i),
                    )
                  }
                />
                {i}
              </label>
            ))}
          </fieldset>
          <label className="span-2">
            Quelques mots sur votre famille (facultatif)
            <textarea
              name="bio"
              defaultValue={profile.bio}
              maxLength={600}
              placeholder="Depuis quand, ce que vous aimez, ce que vous cherchez…"
            />
          </label>
          <button className="button primary" disabled={busy}>
            <Save size={17} /> Enregistrer mon profil
          </button>
        </form>
        <aside className="profile-side">
          <div className="privacy-banner">
            <MapPin size={22} />
            <div>
              <h2>{place ? place.name : "Choisissez une ville"}</h2>
              <p>
                {place
                  ? neighbours
                    ? `${neighbours} autre${neighbours > 1 ? "s" : ""} famille${neighbours > 1 ? "s" : ""} de ParentEd ${neighbours > 1 ? "sont visibles" : "est visible"} à ${place.name}.`
                    : `Vous seriez la première famille visible à ${place.name}.`
                  : "La ville sert à vous suggérer des familles, groupes et rencontres proches."}
              </p>
            </div>
          </div>
          {place && (
            <MapView
              height={260}
              fit={false}
              markers={[
                {
                  id: "me",
                  lat: place.lat,
                  lng: place.lng,
                  title: place.name,
                  kind: "family",
                  count: neighbours + 1,
                },
              ]}
              selectedId="me"
            />
          )}
        </aside>
      </div>
    </>
  );
}
