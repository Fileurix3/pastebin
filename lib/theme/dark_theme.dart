import 'package:custom_roadmap/theme/other_theme.dart';
import 'package:flutter/material.dart';

ThemeData darkTheme = ThemeData(
  appBarTheme: const AppBarTheme(
    color: Color.fromARGB(255, 30, 30, 30),
    titleTextStyle: TextStyle(
      fontSize: 28,
      fontWeight: FontWeight.w400,
      color: Colors.white,
    ),
    centerTitle: true,
  ),
  colorScheme: ColorScheme.dark(
    primary: Colors.indigo,
    onPrimary: Colors.grey.shade300,
    secondary: Colors.indigo.shade200,
    tertiary: const Color.fromARGB(255, 45, 45, 45),
    surface: const Color.fromARGB(255, 30, 30, 30),
    inversePrimary: Colors.grey.shade300,
    shadow: const Color.fromARGB(5, 0, 0, 0),
    error: Colors.red.shade400,
    brightness: Brightness.dark,
  ),
  inputDecorationTheme: inputDecoration(Colors.grey[350]),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: elevationButtonStyle(Colors.indigo, Colors.white),
  ),
  textTheme: textTheme,
);
