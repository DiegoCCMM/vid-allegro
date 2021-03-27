#include <stdio.h>
#include <stdlib.h>
#include <allegro5/allegro5.h>
#include <allegro5/allegro_font.h>
#include <allegro5/allegro_image.h>
#include <allegro5/allegro_primitives.h>

void must_init(bool test, const char *description)
{
    if(test) return;

    printf("couldn't initialize %s\n", description);
    exit(1);
}

enum BOUNCER_TYPE {
    BT_HELLO = 0,
    BT_N
};

typedef struct BOUNCER
{
    float x, y;
    float dx, dy;
    int type;
} BOUNCER;

int main()
{
    must_init(al_init(), "allegro");
    must_init(al_install_keyboard(), "keyboard");

    ALLEGRO_TIMER* timer = al_create_timer(1.0 / 30.0);
    must_init(timer, "timer");

    ALLEGRO_EVENT_QUEUE* queue = al_create_event_queue();
    must_init(queue, "queue");

    al_set_new_display_option(ALLEGRO_SAMPLE_BUFFERS, 1, ALLEGRO_SUGGEST);
    al_set_new_display_option(ALLEGRO_SAMPLES, 8, ALLEGRO_SUGGEST);
    al_set_new_bitmap_flags(ALLEGRO_MIN_LINEAR | ALLEGRO_MAG_LINEAR);

    ALLEGRO_DISPLAY* disp = al_create_display(640, 480);
    must_init(disp, "display");

    ALLEGRO_FONT* font = al_create_builtin_font();
    must_init(font, "font");

    must_init(al_init_image_addon(), "image addon");
    ALLEGRO_BITMAP* mysha = al_load_bitmap("../agame/src/mysha.png");
    must_init(mysha, "mysha");

    must_init(al_init_primitives_addon(), "primitives");

    al_register_event_source(queue, al_get_keyboard_event_source());
    al_register_event_source(queue, al_get_display_event_source(disp));
    al_register_event_source(queue, al_get_timer_event_source(timer));

    bool done = false;
    bool redraw = true;
    ALLEGRO_EVENT event;

    BOUNCER obj[BT_N];
    for(int i = 0; i < BT_N; i++)
    {
        BOUNCER* b = &obj[i];
        b->x = rand() % 640;
        b->y = rand() % 480;
        b->dx = ((((float)rand()) / RAND_MAX) - 0.5) * 2 * 4;
        b->dy = ((((float)rand()) / RAND_MAX) - 0.5) * 2 * 4;
        b->type = i;
    }

    al_start_timer(timer);
    while(1)
    {
        al_wait_for_event(queue, &event);

        switch(event.type)
        {
            case ALLEGRO_EVENT_TIMER:
                for(int i = 0; i < BT_N; i++)
                {
                    BOUNCER* b = &obj[i];
                    b->x += b->dx;
                    b->y += b->dy;

                    if(b->x < 0)
                    {
                        b->x  *= -1;
                        b->dx *= -1;
                    }
                    if(b->x > 545)
                    {
                        b->x -= (b->x - 545);
                        b->dx *= -1;
                    }
                    if(b->y < 0)
                    {
                        b->y  *= -1;
                        b->dy *= -1;
                    }
                    if(b->y > 470)
                    {
                        b->x -= (b->y - 470);
                        b->dy *= -1;
                    }
                }

                redraw = true;
                break;

            case ALLEGRO_EVENT_KEY_DOWN:
            case ALLEGRO_EVENT_DISPLAY_CLOSE:
                done = true;
                break;
        }

        if(done)
            break;

        if(redraw && al_is_event_queue_empty(queue))
        {
            ALLEGRO_VERTEX v[4];
            al_clear_to_color(al_map_rgb(0, 0, 0));

            for(int i = 0; i < BT_N; i++)
            {
                BOUNCER* b = &obj[i];
                switch(b->type)
                {
                    case BT_HELLO:
                        al_draw_text(font, al_map_rgb(255, 255, 255), b->x, b->y, 0, "Hello world!");
                        break;
                }
            }

            al_flip_display();
            redraw = false;
        }
    }

    al_destroy_bitmap(mysha);
    al_destroy_font(font);
    al_destroy_display(disp);
    al_destroy_timer(timer);
    al_destroy_event_queue(queue);

    return 0;
}