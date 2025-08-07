import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
}

export const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_public', true)
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date')
          .limit(6);
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section id="events" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upcoming Events & Health Camps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us for special events, free health camps, and educational seminars to maintain your oral health
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground">Check back soon for new events and health camps!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(event.event_date), 'MMM dd')}
                      </Badge>
                      <Badge variant="secondary">
                        Free Event
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        <span>{format(new Date(event.event_date), 'EEEE, MMMM dd, yyyy')}</span>
                      </div>
                      
                      {event.event_time && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.event_time}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Register for Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Want to be notified about upcoming events?
              </p>
              <Button variant="outline" size="lg" className="px-8">
                Subscribe to Updates
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};