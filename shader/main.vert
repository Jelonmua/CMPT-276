#version 300 es

in vec4 a_Position;

uniform vec2 u_resolution;

void main() {
  gl_Position = a_Position;
}
