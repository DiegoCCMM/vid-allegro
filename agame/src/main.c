#include <stdio.h>

#include <allegro5/allegro.h>
#include <allegro5/allegro_font.h>
#include <allegro5/allegro_ttf.h>
#include <allegro5/allegro_native_dialog.h>
#include <allegro5/allegro_primitives.h>

ALLEGRO_DISPLAY *display = NULL;

ALLEGRO_FONT * safe_load_font(char const * filename, int size, int flags) {
  ALLEGRO_FONT * font = al_load_font(filename, size, flags);
  if (!font) {
    char msg[256];
    sprintf(msg, "failed to load font: %s", filename);
    al_show_native_message_box(NULL, "error", "failed to load font",
                               msg, NULL,
                               ALLEGRO_MESSAGEBOX_ERROR);
  }
  return font;
}

int agame_msg(char const * msg, ALLEGRO_FONT * font) {
  int w = al_get_display_width(display);
  int h = al_get_display_height(display);
  // Draw the bounding box
  al_draw_filled_rounded_rectangle(0, h - h/3.0, w, h,
                                   10, 10, al_map_rgb(120, 120, 120));
  al_draw_filled_rounded_rectangle(5, h - h/3.0 + 5, w - 5, h - 5,
                                   10, 10, al_map_rgb(230, 230, 230));
  al_draw_rounded_rectangle(5, h - h/3.0 + 5, w - 5, h - 5,
                            10, 10, al_map_rgb(0, 0, 0), 3);
  al_draw_justified_text(font, al_map_rgb(0, 0, 0), 10, w - 10,
                         h - h/3.0 + 10, 16, 0, msg);
  return 1;
}

int main(void) {
  if(!al_init()) {
    al_show_native_message_box(NULL, NULL, NULL,
                               "failed to initialize allegro!", NULL, 0);
    return -1;
  }

  display = al_create_display(640, 640);

  if(!display) {
    al_show_native_message_box(NULL, NULL, NULL,
                               "failed to initialize display!", NULL, 0);
    return -1;
  }

  al_init_font_addon();
  al_init_ttf_addon();
  al_init_primitives_addon();

  ALLEGRO_FONT * font24 = safe_load_font("bin/arial.ttf", 24, 0);
  if (!font24) {return -1;}
  ALLEGRO_FONT * font36 = safe_load_font("bin/arial.ttf", 36, 0);
  if (!font36) {return -1;}
  ALLEGRO_FONT * font18 = safe_load_font("bin/arial.ttf", 18, 0);
  if (!font18) {return -1;}

  al_clear_to_color(al_map_rgb(255, 255, 255));

  agame_msg("This is a message for the player of agame, but it is really "
            "long and needs to be wrapped.", font24);

  // al_draw_text(font24, al_map_rgb(255, 0, 255), 50, 50, 0,
  //              "Hello World, this is 24 point");
  // al_draw_text(font36, al_map_rgb(255, 127, 127), 640 / 2, 480 / 2,
  //              ALLEGRO_ALIGN_CENTRE, "This is Centered and 36 point");
  // al_draw_text(font18, al_map_rgb(15, 240, 18), 620, 350, ALLEGRO_ALIGN_RIGHT,
  //              "This is right aligned and 18 point");

  // al_draw_textf(font18, al_map_rgb(255, 255, 255), screen_w/2, 400,
  //               ALLEGRO_ALIGN_CENTRE,
  //               "TEXT with variable output (textf): Screen width and height "
  //               "= %i / %i" , screen_w, screen_h);

  al_flip_display();

  al_rest(4.0);

  al_destroy_font(font18);
  al_destroy_font(font24);
  al_destroy_font(font36);
  al_destroy_display(display);

  return 0;
}