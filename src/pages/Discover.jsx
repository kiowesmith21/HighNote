
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Search, Filter, Music2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const [cityStats, setCityStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cityLocations = [
    { id: 1, city: "Los Angeles", coordinates: [34.0522, -118.2437], image: "los-angeles-music-scene.jpg" },
    { id: 2, city: "New York", coordinates: [40.7128, -74.0060], image: "new-york-music-scene.jpg" },
    { id: 3, city: "Chicago", coordinates: [41.8781, -87.6298], image: "chicago-music-scene.jpg" },
    { id: 4, city: "Miami", coordinates: [25.7617, -80.1918], image: "miami-music-scene.jpg" },
    { id: 5, city: "Atlanta", coordinates: [33.7490, -84.3880], image: "atlanta-music-scene.jpg" },
    { id: 6, city: "Nashville", coordinates: [36.1627, -86.7816], image: "nashville-music-scene.jpg" },
    { id: 7, city: "Austin", coordinates: [30.2672, -97.7431], image: "austin-music-scene.jpg" },
    { id: 8, city: "Boston", coordinates: [42.3601, -71.0589], image: "boston-music-scene.jpg" }
  ];

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      const stats = {};
      for (const { city } of cityLocations) {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('city', city)
          .eq('role', 'artist');

        if (error) throw error;
        console.log(`${city} artists:`, data); // Debug log
        stats[city] = data?.length || 0;
      }
      setCityStats(stats);
    } catch (error) {
      console.error('Error fetching city stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Discover Artists</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search artists..."
              className="pl-10 h-10 w-[250px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <Button variant="outline" className="text-foreground">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="h-[400px] rounded-lg border overflow-hidden">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cityLocations.map((location) => (
            <Marker key={location.id} position={location.coordinates}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-foreground">{location.city}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cityStats[location.city] || 0} artists in this area
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => navigate(`/city/${location.city}`)}
                  >
                    View Artists
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cityLocations.map((city) => (
          <div key={city.id} className="group relative rounded-lg border overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img  
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" 
                alt={`${city.city} music scene`}
                src="https://images.unsplash.com/photo-1491266519160-57fecd7d4661" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold mb-1 text-white">{city.city}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-white">
                  <Music2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">{cityStats[city.city] || 0} Artists</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/city/${city.city}`)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white"
                >
                  Browse Artists
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
