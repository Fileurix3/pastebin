import 'package:custom_roadmap/bloc/custom%20roadmap/custom_roadmap_state.dart';
import 'package:custom_roadmap/bloc/roadmap%20element/roadmap_element_state.dart';
import 'package:custom_roadmap/bloc/theme/theme_state.dart';
import 'package:custom_roadmap/pages/about_roadmap_element_page.dart';
import 'package:custom_roadmap/pages/home_page.dart';
import 'package:custom_roadmap/pages/roadmap_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'theme/dark_theme.dart';
import 'theme/light_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final SharedPreferences prefs = await SharedPreferences.getInstance();
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider<ThemeCubit>(create: (_) => ThemeCubit()),
        BlocProvider<RoadmapElementCubit>(create: (_) => RoadmapElementCubit()),
        BlocProvider<CustomRoadmapCubit>(create: (_) => CustomRoadmapCubit()),
      ],
      child: MyApp(
        sharedPreferences: prefs,
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  final SharedPreferences sharedPreferences;

  const MyApp({super.key, required this.sharedPreferences});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeState>(
      builder: (context, state) {
        return MaterialApp(
          theme: state.darkTheme == false ? lightTheme : darkTheme,
          home: const HomePage(),
          routes: {
            "/roadmapPage": (context) => const RoadmapPage(),
            "/aboutRoadmapElementPage": (context) => const AboutRoadmapElementPage(),
          },
        );
      },
    );
  }
}
