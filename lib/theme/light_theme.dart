import 'package:custom_roadmap/theme/other_theme.dart';
import 'package:flutter/material.dart';

ThemeData lightTheme = ThemeData(
  appBarTheme: AppBarTheme(
    color: Colors.grey.shade300,
    titleTextStyle: const TextStyle(
      fontSize: 28,
      fontWeight: FontWeight.w400,
      color: Colors.black,
    ),
    centerTitle: true,
  ),
  colorScheme: ColorScheme.light(
    primary: Colors.orange,
    onPrimary: Colors.grey.shade900,
    secondary: Colors.orange.shade100,
    tertiary: Colors.grey.shade200,
    surface: Colors.grey.shade300,
    inversePrimary: Colors.grey.shade900,
    shadow: const Color.fromARGB(15, 0, 0, 0),
    error: Colors.red.shade400,
    brightness: Brightness.light,
  ),
  inputDecorationTheme: inputDecoration(Colors.black),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: elevationButtonStyle(Colors.orange, Colors.black),
  ),
  textTheme: textTheme,
);
