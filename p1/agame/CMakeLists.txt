## Project Setup
cmake_minimum_required(VERSION 2.8)

set(PROJECT_NAME agame)

project(${PROJECT_NAME})

## Configurations

# Set the default path for built executables to the "bin" directory
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
# set the default path for built libraries to the "lib" directory
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)

# Uncomment the line below to set the build type
# set(CMAKE_BUILD_TYPE DEBUG)

# Extend the find_package search path
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/")

## Configure the build system

# Add the include folder to the include path
include_directories(${PROJECT_SOURCE_DIR}/include)

# Set the source files, headers, and link libraries
set(${PROJECT_NAME}_SRCS src/main.c)
# set(${PROJECT_NAME}_HEADERS include/${PROJECT_NAME}/${PROJECT_NAME}.h)
set(${PROJECT_NAME}_LINK_LIBS )

## Build the agame project

# Find Allegro
find_package(allegro REQUIRED COMPONENTS
  main font ttf native_dialog primitives tiled
)
include_directories(${allegro_INCLUDE_DIRS})
list(APPEND ${PROJECT_NAME}_LINK_LIBS ${allegro_LIBRARIES})

# Compile the Library
add_executable(${PROJECT_NAME} ${${PROJECT_NAME}_SRCS})
target_link_libraries(${PROJECT_NAME} ${${PROJECT_NAME}_LINK_LIBS})
