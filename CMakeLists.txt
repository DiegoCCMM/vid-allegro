cmake_minimum_required(VERSION 3.17)
project(allegro5Tutorial)

set(CMAKE_CXX_STANDARD 20)

add_executable(allegro5Tutorial main.cpp)

find_library(ALLEGRO NAMES allegro REQUIRED)
if (${ALLEGRO} STREQUAL "ALLEGRO-NOTFOUND")
    message(FATAL_ERROR "Allegro library not found")
endif ()

target_link_libraries(allegro5Tutorial PRIVATE ${ALLEGRO})

find_library(ALLEGRO2 NAMES allegro_font REQUIRED)
if (${ALLEGRO2} STREQUAL "ALLEGRO-NOTFOUND")
    message(FATAL_ERROR "Allegro library not found")
endif ()

target_link_libraries(allegro5Tutorial PRIVATE ${ALLEGRO2})